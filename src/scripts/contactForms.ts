import { publish } from '~/lib/analytics/bus';

const STATUS_BASE: Record<string, string> = {
  dark: 'text-sm text-white/80',
  light: 'text-sm text-klika-dark/70'
};

function setStatus(
  statusEl: HTMLElement,
  kind: 'ok' | 'err' | 'loading',
  message: string,
  tone: string
) {
  const base = STATUS_BASE[tone] ?? STATUS_BASE.light;
  statusEl.textContent = message;
  statusEl.className = base;
  if (kind === 'ok') statusEl.classList.add('text-success');
  if (kind === 'err') statusEl.classList.add('text-error');
  if (kind === 'loading') statusEl.classList.add('opacity-80');
}

function bindContactForm(root: HTMLElement) {
  const form = root.querySelector('form');
  if (!(form instanceof HTMLFormElement)) return;

  const formSurface = root.dataset.formSurface ?? 'inline';
  const tone = root.dataset.contactTone === 'light' ? 'light' : 'dark';
  const statusEl = form.querySelector<HTMLElement>('[data-contact-status]');
  const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!statusEl) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const accessKeyInput = form.querySelector('input[name="access_key"]');
    const key = accessKeyInput instanceof HTMLInputElement ? accessKeyInput.value.trim() : '';
    if (!key) {
      setStatus(statusEl, 'err', 'Form is not configured.', tone);
      return;
    }

    const emailEl = form.querySelector('input[name="email"]');
    if (emailEl instanceof HTMLInputElement) {
      emailEl.setCustomValidity('');
      const value = emailEl.value.trim();
      if (!value) {
        emailEl.setCustomValidity('Ingresá tu email.');
      } else if (emailEl.validity.typeMismatch) {
        emailEl.setCustomValidity('Ingresá un email válido.');
      }
      if (!emailEl.checkValidity()) {
        if (typeof emailEl.reportValidity === 'function') emailEl.reportValidity();
        emailEl.focus();
        setStatus(statusEl, 'err', 'Por favor, revisá el email.', tone);
        return;
      }
    }

    const fd = new FormData(form);
    const botcheck = String(fd.get('botcheck') || '');
    if (botcheck) {
      setStatus(statusEl, 'err', 'Something went wrong.', tone);
      return;
    }

    const payload: Record<string, string> = {
      access_key: key,
      email: String(fd.get('email') ?? '').trim(),
      message: String(fd.get('message') ?? '').trim(),
      subject: 'Contact form — byklika.com'
    };

    const projectStage = String(fd.get('project_stage') ?? '').trim();
    if (projectStage) {
      payload.project_stage = projectStage;
    }

    if (submitBtn) submitBtn.disabled = true;
    setStatus(statusEl, 'loading', 'Enviando…', tone);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        body?: { message?: string };
      };

      const ok = data.success === true;
      const msg =
        data.message ||
        data.body?.message ||
        (ok ? 'Mensaje enviado. Te respondemos pronto.' : 'No pudimos enviar tu mensaje.');

      if (ok) {
        setStatus(statusEl, 'ok', msg, tone);
        publish({
          name: 'contact_form_submit',
          params: { form_location: formSurface }
        });
        form.reset();
        if (accessKeyInput instanceof HTMLInputElement) accessKeyInput.value = key;
      } else {
        setStatus(statusEl, 'err', msg, tone);
      }
    } catch {
      setStatus(statusEl, 'err', 'Error de red. Probá de nuevo.', tone);
    } finally {
      if (submitBtn && key) submitBtn.disabled = false;
    }
  });
}

export function initContactForms(): void {
  document.querySelectorAll<HTMLElement>('.contact-form-component[data-contact-form]').forEach(bindContactForm);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initContactForms(), { once: true });
} else {
  initContactForms();
}

export {};
