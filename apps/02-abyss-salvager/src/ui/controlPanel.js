/**
 * Parameter control panel.
 *
 * Built from the SCHEMA in model/params.js so the UI and the parameter set can
 * never drift apart. Every control writes straight into the live state object
 * and fires a change callback.
 */

export function createControlPanel(root, state, schema, onChange) {
  root.innerHTML = '';

  const inputs = new Map();

  for (const group of schema) {
    const sec = document.createElement('section');
    sec.className = 'panel-group';

    const h = document.createElement('h3');
    h.className = 'panel-group-title';
    h.textContent = group.group;
    sec.appendChild(h);

    for (const item of group.items) {
      const row = document.createElement('div');
      row.className = 'panel-row';

      const label = document.createElement('label');
      label.className = 'panel-label';
      label.innerHTML = `<span class="cn">${item.label}</span><span class="en">${item.en}</span>`;
      row.appendChild(label);

      const controlWrap = document.createElement('div');
      controlWrap.className = 'panel-control';

      if (item.type === 'color') {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = state[item.key];
        input.addEventListener('input', () => {
          state[item.key] = input.value;
          onChange(item.key, input.value);
        });
        controlWrap.appendChild(input);
        const hex = document.createElement('span');
        hex.className = 'panel-value';
        hex.textContent = state[item.key].toUpperCase();
        controlWrap.appendChild(hex);
        inputs.set(item.key, { set: (v) => { input.value = v; hex.textContent = v.toUpperCase(); } });
      } else if (item.type === 'toggle') {
        const input = document.createElement('button');
        input.className = 'toggle';
        input.setAttribute('role', 'switch');
        const sync = (v) => {
          input.setAttribute('aria-checked', String(!!v));
          input.classList.toggle('on', !!v);
        };
        sync(state[item.key]);
        input.addEventListener('click', () => {
          state[item.key] = !state[item.key];
          sync(state[item.key]);
          onChange(item.key, state[item.key]);
        });
        controlWrap.appendChild(input);
        inputs.set(item.key, { set: sync });
      } else if (item.type === 'select') {
        const sel = document.createElement('select');
        for (const opt of item.options) {
          const o = document.createElement('option');
          o.value = opt.value;
          o.textContent = opt.label;
          sel.appendChild(o);
        }
        sel.value = state[item.key];
        sel.addEventListener('change', () => {
          state[item.key] = sel.value;
          onChange(item.key, sel.value);
        });
        controlWrap.appendChild(sel);
        inputs.set(item.key, { set: (v) => { sel.value = v; } });
      } else {
        const input = document.createElement('input');
        input.type = 'range';
        input.min = item.min;
        input.max = item.max;
        input.step = item.step;
        input.value = state[item.key];
        const val = document.createElement('span');
        val.className = 'panel-value';
        const fmt = (v) => (item.step < 1 ? Number(v).toFixed(2) : String(v));
        val.textContent = fmt(state[item.key]);
        input.addEventListener('input', () => {
          const v = parseFloat(input.value);
          state[item.key] = v;
          val.textContent = fmt(v);
          onChange(item.key, v);
        });
        controlWrap.appendChild(input);
        controlWrap.appendChild(val);
        inputs.set(item.key, { set: (v) => { input.value = v; val.textContent = fmt(v); } });
      }

      row.appendChild(controlWrap);
      sec.appendChild(row);
    }
    root.appendChild(sec);
  }

  function syncAll() {
    for (const [key, ctl] of inputs) ctl.set(state[key]);
  }

  return { syncAll, inputs };
}
