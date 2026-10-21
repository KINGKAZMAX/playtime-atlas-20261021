/**
 * Keyboard + mouse input with a resilient pointer-lock strategy.
 *
 * Pointer lock is the "ideal" mode. When the browser refuses to grant it
 * (embedded frames, permission policies, user gesture issues) the game
 * silently switches to a fallback where the ship is steered by
 *   - dragging with the left mouse button, and/or
 *   - the arrow keys,
 * so the game is always fully playable.
 */
export class Input {
  constructor(domElement) {
    this.dom = domElement;
    this.keys = new Set();
    this.pressed = new Set();      // keys pressed during the current frame
    this.mouseDX = 0;
    this.mouseDY = 0;
    this.dragging = false;
    this.pointerLocked = false;
    this.lockFailed = false;
    this.lockErrorMessage = '';
    this.enabled = true;
    this.sensitivity = 1;
    this.invertY = false;
    this.onKeyAction = () => {};
    /** Fired when the browser drops the pointer lock (e.g. the user pressed Esc). */
    this.onPointerLockLost = () => {};
    this._suppressLockLost = false;
    /**
     * Timestamp of the last Tab keydown.
     *
     * Tab belongs to the browser: it walks the focus ring. When the focus
     * leaves the page (or in browsers that treat Tab as a lock-breaking
     * gesture) Chrome drops the pointer lock. That is keyboard navigation,
     * not "the pilot pressed Esc", so the game must not pause on it.
     */
    this._lastTabAt = -Infinity;
    /**
     * Timestamp of the last Escape keydown that actually reached the page.
     *
     * While the pointer is locked Chrome reserves Esc: it releases the lock
     * and may or may not deliver the keydown. Both signals arrive (in an
     * unpredictable order), so the game needs to know whether the Esc key
     * itself was seen — otherwise one Esc gesture could be counted twice and
     * open the pause menu right after closing it.
     */
    this._lastEscapeAt = -Infinity;
    /**
     * Predicate: should the game capture Tab instead of letting the browser
     * move the focus?
     *
     * While the pilot is flying, every overlay is closed, so the cockpit view
     * is the only focusable thing in the document. Handing Tab to the browser
     * there would move the focus into the browser chrome — which also drops
     * the pointer lock, so the player would lose mouse steering by pressing
     * a navigation key. The game therefore keeps the focus on its own
     * surface. In the menus (any overlay open) the browser keeps full
     * control and Tab walks the buttons as usual.
     */
    this.captureTab = () => false;

    this._lastMouse = { x: 0, y: 0 };
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onKeyUp = this._handleKeyUp.bind(this);
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onMouseDown = this._handleMouseDown.bind(this);
    this._onMouseUp = this._handleMouseUp.bind(this);
    this._onLockChange = this._handleLockChange.bind(this);
    this._onLockError = this._handleLockError.bind(this);
    this._onBlur = this._handleBlur.bind(this);
    this._onContextMenu = (e) => e.preventDefault();

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('blur', this._onBlur);
    document.addEventListener('pointerlockchange', this._onLockChange);
    document.addEventListener('pointerlockerror', this._onLockError);
    this.dom.addEventListener('contextmenu', this._onContextMenu);
  }

  /* -------------------------------------------------------------- *
   *  Public API
   * -------------------------------------------------------------- */

  isDown(code) {
    return this.keys.has(code);
  }

  /** True only on the frame the key transitioned to down. */
  wasPressed(code) {
    return this.pressed.has(code);
  }

  /** Any of the given codes is currently held. */
  anyDown(...codes) {
    return codes.some((c) => this.keys.has(c));
  }

  requestLock() {
    if (this.pointerLocked) return;
    const el = this.dom;
    try {
      const result = el.requestPointerLock({ unadjustedMovement: false });
      if (result && typeof result.then === 'function') {
        result.catch((err) => {
          // Chrome rejects the options object on some platforms — retry plainly.
          try {
            const retry = el.requestPointerLock();
            if (retry && typeof retry.then === 'function') {
              retry.catch((err2) => this._handleLockError(err2));
            }
          } catch {
            this._handleLockError(err);
          }
        });
      }
    } catch (err) {
      this._handleLockError(err);
    }
  }

  releaseLock() {
    this._suppressLockLost = true;
    if (document.pointerLockElement === this.dom) {
      document.exitPointerLock();
    }
    // Clear the flag on the next tick in case no change event fires.
    setTimeout(() => { this._suppressLockLost = false; }, 0);
  }

  /** Consume accumulated mouse delta (radians-free raw pixels). */
  consumeMouseDelta() {
    const dx = this.mouseDX;
    const dy = this.mouseDY;
    this.mouseDX = 0;
    this.mouseDY = 0;
    return { dx, dy };
  }

  endFrame() {
    this.pressed.clear();
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('blur', this._onBlur);
    document.removeEventListener('pointerlockchange', this._onLockChange);
    document.removeEventListener('pointerlockerror', this._onLockError);
    this.dom.removeEventListener('contextmenu', this._onContextMenu);
  }

  /* -------------------------------------------------------------- *
   *  Handlers
   * -------------------------------------------------------------- */

  _handleKeyDown(e) {
    // Remember every Esc keydown that reaches the page, before any of the
    // early returns below: the game needs it to recognise a single Esc
    // gesture that shows up twice (keydown + pointer lock loss).
    if (e.code === 'Escape') this._lastEscapeAt = performance.now();

    // When a real control has focus (buttons, sliders, selects inside the
    // overlays) the browser must keep full control of the keyboard: Space
    // has to activate buttons, arrows have to move sliders, and Tab has to
    // walk the focus ring. Game keys are ignored in that case.
    if (this._isInteractiveTarget(document.activeElement)) {
      if (e.code === 'Escape') this.onKeyAction(e.code, e);
      return;
    }

    if (e.code === 'Tab') {
      // Remember Tab presses: moving the focus can make the browser drop the
      // pointer lock, and that must not be mistaken for an Esc press.
      this._lastTabAt = performance.now();
      if (this.captureTab()) {
        // Keep the focus inside the document, on the cockpit view.
        e.preventDefault();
        this._focusSurface();
        return;
      }
    }

    if (e.repeat) {
      // still swallow browser defaults for game keys
      if (this._shouldPreventDefault(e.code)) e.preventDefault();
      return;
    }
    if (this._shouldPreventDefault(e.code)) e.preventDefault();
    this.keys.add(e.code);
    this.pressed.add(e.code);
    this.onKeyAction(e.code, e);
  }

  _handleKeyUp(e) {
    this.keys.delete(e.code);
  }

  _isInteractiveTarget(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    const tag = (el.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA'
      || tag === 'BUTTON' || tag === 'A' || tag === 'OPTION'
      || el.isContentEditable === true;
  }

  /**
   * True when a Tab key was pressed a moment ago.
   *
   * Used to tell "the focus moved and the browser dropped the pointer lock"
   * apart from "the pilot pressed Esc, which Chrome consumed to release the
   * lock". Only the latter should open the pause menu.
   */
  tabPressedRecently(windowMs = 400) {
    return performance.now() - this._lastTabAt < windowMs;
  }

  /**
   * Timestamp of the last Esc keydown that reached the page.
   * See the constructor for why the game needs it.
   */
  lastEscapeAt() {
    return this._lastEscapeAt;
  }

  /**
   * Move the keyboard focus onto the cockpit view.
   *
   * The canvas carries `tabindex="0"`, so it is a real stop in the focus
   * ring and the browser paints the focus ring for it.
   */
  _focusSurface() {
    const el = this._surfaceElement();
    if (!el) return;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    try {
      el.focus({ preventScroll: true });
    } catch {
      el.focus();
    }
  }

  /** The element that represents the game surface for focus purposes. */
  _surfaceElement() {
    const dom = this.dom;
    if (!dom) return null;
    if (dom.tagName === 'CANVAS') return dom;
    // `dom` is usually the container/body — the canvas lives inside it.
    return dom.querySelector ? dom.querySelector('canvas') : null;
  }

  /**
   * Game keys that must not trigger the browser's own behaviour.
   * NOTE: 'Tab' is intentionally absent — the focus ring has to stay usable.
   */
  _shouldPreventDefault(code) {
    return [
      'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'KeyF',
      'KeyR', 'KeyM', 'KeyH', 'KeyV', 'KeyX', 'KeyB', 'ControlLeft', 'ControlRight',
    ].includes(code);
  }

  _handleMouseMove(e) {
    if (!this.enabled) return;
    if (this.pointerLocked) {
      this.mouseDX += (e.movementX || 0) * this.sensitivity;
      this.mouseDY += (e.movementY || 0) * this.sensitivity;
      return;
    }
    // Fallback: steer while dragging with the primary button.
    if (this.dragging) {
      const dx = e.clientX - this._lastMouse.x;
      const dy = e.clientY - this._lastMouse.y;
      this.mouseDX += dx * this.sensitivity * 1.35;
      this.mouseDY += dy * this.sensitivity * 1.35;
    }
    this._lastMouse.x = e.clientX;
    this._lastMouse.y = e.clientY;
  }

  _handleMouseDown(e) {
    if (e.button === 0) {
      this.dragging = true;
      this._lastMouse.x = e.clientX;
      this._lastMouse.y = e.clientY;
    }
  }

  _handleMouseUp(e) {
    if (e.button === 0) this.dragging = false;
  }

  _handleLockChange() {
    const locked = document.pointerLockElement === this.dom;
    const wasLocked = this.pointerLocked;
    this.pointerLocked = locked;
    if (locked) {
      this.lockFailed = false;
      this.lockErrorMessage = '';
      return;
    }
    // The browser dropped the lock. Most of the time the user pressed Esc,
    // which Chrome consumes as a reserved gesture — the keydown never
    // reaches us, so the game has to react to the lock loss itself.
    if (wasLocked && !this._suppressLockLost) {
      this.onPointerLockLost();
    }
  }

  _handleLockError(err) {
    this.lockFailed = true;
    this.pointerLocked = false;
    this.lockErrorMessage = (err && err.message) ? err.message : 'Pointer lock unavailable';
    console.warn('[Input] pointer lock failed — falling back to drag/arrow steering', err);
  }

  _handleBlur() {
    this.keys.clear();
    this.dragging = false;
  }
}
