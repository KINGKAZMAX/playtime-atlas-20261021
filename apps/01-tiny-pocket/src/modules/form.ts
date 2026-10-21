/**
 * Reservation form: local-only validation and a simulated submit.
 * Nothing is sent to any network endpoint.
 */

interface Rule {
  id: string;
  test: (value: string) => boolean;
  message: string;
}

export function initForm(): void {
  const form = document.getElementById('reserve-form') as HTMLFormElement | null;
  if (!form) return;

  const status = document.getElementById('reserve-status');
  const submit = document.getElementById('reserve-submit') as HTMLButtonElement | null;
  const label = submit?.querySelector<HTMLElement>('.btn__label');

  const rules: Rule[] = [
    {
      id: 'f-name',
      test: (v) => v.trim().length >= 2,
      message: '请填一个至少 2 个字的称呼',
    },
    {
      id: 'f-email',
      test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
      message: '邮箱格式看起来不太对',
    },
    {
      id: 'f-use',
      test: (v) => v !== '',
      message: '选一个主要用途，我们好安排测试固件',
    },
  ];

  const fieldOf = (id: string) => document.getElementById(id)?.closest<HTMLElement>('.field');
  const errOf = (id: string) =>
    document.querySelector<HTMLElement>(`[data-err-for="${id}"]`);

  const setError = (id: string, message: string | null) => {
    const field = fieldOf(id);
    const err = errOf(id);
    if (field) field.classList.toggle('has-error', Boolean(message));
    if (err) err.textContent = message ?? '';
  };

  // live re-validation once a field has been marked
  for (const rule of rules) {
    const input = document.getElementById(rule.id) as HTMLInputElement | HTMLSelectElement | null;
    if (!input) continue;
    const revalidate = () => {
      if (!fieldOf(rule.id)?.classList.contains('has-error')) return;
      setError(rule.id, rule.test(input.value) ? null : rule.message);
    };
    input.addEventListener('input', revalidate);
    input.addEventListener('change', revalidate);
    input.addEventListener('blur', () => {
      if (input.value.trim() === '') return;
      setError(rule.id, rule.test(input.value) ? null : rule.message);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let firstBad: string | null = null;
    for (const rule of rules) {
      const input = document.getElementById(rule.id) as HTMLInputElement | HTMLSelectElement | null;
      const value = input?.value ?? '';
      const ok = rule.test(value);
      setError(rule.id, ok ? null : rule.message);
      if (!ok && !firstBad) firstBad = rule.id;
    }

    if (firstBad) {
      if (status) {
        status.textContent = '还有几项没填好，已经标出来了。';
        status.classList.add('is-error');
      }
      document.getElementById(firstBad)?.focus();
      return;
    }

    if (status) {
      status.classList.remove('is-error');
      status.textContent = '正在本地校验…';
    }
    if (submit) {
      submit.classList.add('is-busy');
      submit.disabled = true;
    }
    if (label) label.textContent = '提交中…';

    window.setTimeout(() => {
      if (submit) {
        submit.classList.remove('is-busy');
        submit.classList.add('is-done');
        submit.disabled = false;
      }
      if (label) label.textContent = '已收到 ✓';
      if (status) {
        const name = (document.getElementById('f-name') as HTMLInputElement | null)?.value.trim();
        status.textContent = `谢谢你，${name || '朋友'}。这条申请只在这台设备上完成校验，没有发往任何服务器。`;
      }
      form.reset();
    }, 900);
  });
}
