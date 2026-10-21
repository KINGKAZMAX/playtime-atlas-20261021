/**
 * 霓虹街廊 · 街机可玩展厅
 * src/ui/touch.js — 触屏虚拟控制器
 *
 * 在触控设备上显示方向键与动作键；按下状态写入 input 的虚拟按键集合，
 * 与键盘共用同一套逻辑，触屏玩家与键盘玩家拥有完全相同的操作能力。
 */

export function createTouchPad(root, input, { onAction } = {}) {
  root.innerHTML = `
    <div class="dpad" role="group" aria-label="方向控制">
      <button type="button" class="dpad__btn dpad__btn--up" data-dir="up" aria-label="上">▲</button>
      <button type="button" class="dpad__btn dpad__btn--left" data-dir="left" aria-label="左">◀</button>
      <button type="button" class="dpad__btn dpad__btn--right" data-dir="right" aria-label="右">▶</button>
      <button type="button" class="dpad__btn dpad__btn--down" data-dir="down" aria-label="下">▼</button>
    </div>
    <div class="tpad__actions" role="group" aria-label="动作按钮">
      <button type="button" class="tpad__btn" data-action="action" aria-label="主操作">A</button>
      <button type="button" class="tpad__btn tpad__btn--alt" data-action="skill" aria-label="副操作">B</button>
    </div>
  `;

  const dirButtons = Array.from(root.querySelectorAll('[data-dir]'));
  const actionButtons = Array.from(root.querySelectorAll('[data-action]'));

  function bindHold(btn, name) {
    const press = (e) => {
      e.preventDefault();
      btn.classList.add('is-down');
      input.setVirtual(name, true);
    };
    const release = (e) => {
      e.preventDefault();
      btn.classList.remove('is-down');
      input.setVirtual(name, false);
    };
    btn.addEventListener('pointerdown', press);
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('pointerleave', release);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  dirButtons.forEach((btn) => bindHold(btn, btn.dataset.dir));

  actionButtons.forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      btn.classList.add('is-down');
      input.tapVirtual(btn.dataset.action);
      if (onAction) onAction(btn.dataset.action);
    });
    const up = () => btn.classList.remove('is-down');
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  return {
    /** 按游戏切换可用按钮的文案 */
    setProfile(profile) {
      const map = {
        lattice: { action: '相位', skill: '残响' },
        meteor: { action: '开火', skill: '换弹' },
        hall: { action: '进入', skill: '' },
      };
      const conf = map[profile] || map.hall;
      const a = actionButtons[0];
      const b = actionButtons[1];
      a.textContent = conf.action;
      a.setAttribute('aria-label', conf.action);
      b.textContent = conf.skill || 'B';
      b.setAttribute('aria-label', conf.skill || '副操作');
      b.style.display = conf.skill ? '' : 'none';
    },
    setVisible(v) {
      root.hidden = !v;
    },
    isVisible() {
      return !root.hidden;
    },
  };
}
