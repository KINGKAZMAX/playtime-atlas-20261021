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
    if (document.pointerLockElement === this.dom) {
      document.exitPointerLock();
    }
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

  _shouldPreventDefault(code) {
    return [
      'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Tab', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'KeyF',
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
    this.pointerLocked = locked;
    if (locked) {
      this.lockFailed = false;
      this.lockErrorMessage = '';
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
