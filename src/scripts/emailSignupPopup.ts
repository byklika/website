import { publish } from '~/lib/analytics/bus';
import { submitToWeb3Forms } from '~/lib/web3formsSubmit';

const DEFAULT_ERROR = 'Ingresá un email válido para continuar.';

function readConfig(overlay: HTMLElement) {
  const storageKey = overlay.dataset.storageKey ?? 'email_signup_popup_seen_v1';
  const openAfterMs = Number(overlay.dataset.openAfterMs ?? 50_000);
  const openAtScrollRatio = Number(overlay.dataset.openAtScrollRatio ?? 0.6);
  const autoCloseMs = Number(overlay.dataset.autoCloseMs ?? 2_500);
  return {
    storageKey,
    openAfterMs: Number.isFinite(openAfterMs) ? openAfterMs : 50_000,
    openAtScrollRatio: Number.isFinite(openAtScrollRatio) ? openAtScrollRatio : 0.6,
    autoCloseMs: Number.isFinite(autoCloseMs) ? autoCloseMs : 2_500
  };
}

function boot() {
  const overlay = document.querySelector<HTMLElement>('[data-email-signup-popup-overlay]');
  const dialog = document.querySelector<HTMLElement>('[data-email-signup-popup-dialog]');
  const closeBtn = document.querySelector<HTMLElement>('[data-email-signup-popup-close]');
  const form = document.querySelector<HTMLFormElement>('[data-email-signup-popup-form]');
  const emailInput = document.querySelector<HTMLInputElement>('[data-email-signup-popup-email]');
  const submitBtn = document.querySelector<HTMLButtonElement>('[data-email-signup-popup-submit]');
  const errorEl = document.getElementById('email-signup-popup-error');
  const formView = document.querySelector<HTMLElement>('[data-email-signup-popup-form-view]');
  const confirmView = document.querySelector<HTMLElement>('[data-email-signup-popup-confirm-view]');

  if (
    !(overlay && dialog && closeBtn && form && emailInput && errorEl && formView && confirmView)
  ) {
    return;
  }

  const { storageKey, openAfterMs, openAtScrollRatio, autoCloseMs } = readConfig(overlay);

  let lastFocused: HTMLElement | null = null;
  let prevDocOverflow = '';
  let backgroundEls: Array<{ el: HTMLElement; ariaHidden: string | null; inert: boolean | null }> =
    [];
  let timeoutId: number | null = null;

  const hasSeen = () => {
    try {
      return localStorage.getItem(storageKey) === '1';
    } catch {
      return false;
    }
  };

  const markSeen = () => {
    try {
      localStorage.setItem(storageKey, '1');
    } catch {
      // ignore
    }
  };

  const getFocusable = () => {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    return Array.from(dialog.querySelectorAll<HTMLElement>(selectors.join(','))).filter((node) => {
      return !node.hasAttribute('disabled') && node.getAttribute('aria-hidden') !== 'true';
    });
  };

  const showError = (message: string) => {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    emailInput.classList.add('border-klika-coral');
  };

  const hideError = () => {
    errorEl.textContent = DEFAULT_ERROR;
    errorEl.classList.add('hidden');
    emailInput.classList.remove('border-klika-coral');
  };

  const lockScroll = () => {
    prevDocOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
  };

  const unlockScroll = () => {
    document.documentElement.style.overflow = prevDocOverflow;
  };

  const setBackgroundInert = (enabled: boolean) => {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const main = document.querySelector('main');
    const candidates: HTMLElement[] = [];

    if (header) candidates.push(header as HTMLElement);
    if (footer) candidates.push(footer as HTMLElement);
    if (main) {
      for (const child of Array.from(main.children)) {
        if (child === overlay) continue;
        candidates.push(child as HTMLElement);
      }
    }

    if (enabled) {
      backgroundEls = candidates.map((el) => ({
        el,
        ariaHidden: el.getAttribute('aria-hidden'),
        inert: (el as HTMLElement & { inert?: boolean }).inert ?? null
      }));
      for (const { el } of backgroundEls) {
        el.setAttribute('aria-hidden', 'true');
        (el as HTMLElement & { inert?: boolean }).inert = true;
      }
    } else {
      for (const { el, ariaHidden, inert } of backgroundEls) {
        if (ariaHidden === null) el.removeAttribute('aria-hidden');
        else el.setAttribute('aria-hidden', ariaHidden);
        if (inert !== null) {
          (el as HTMLElement & { inert?: boolean }).inert = inert;
        }
      }
      backgroundEls = [];
    }
  };

  const isOpen = () => overlay.hasAttribute('data-open');

  const open = () => {
    if (hasSeen()) return;

    lastFocused = document.activeElement as HTMLElement | null;

    confirmView.classList.add('hidden');
    formView.classList.remove('hidden');
    hideError();

    lockScroll();
    setBackgroundInert(true);

    overlay.inert = false;
    overlay.setAttribute('data-arm', '');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.setAttribute('data-open', '');
        closeBtn.focus();
      });
    });

    cleanupTriggers();
  };

  const close = ({ markSeenOnClose = true }: { markSeenOnClose?: boolean } = {}) => {
    if (!isOpen()) return;
    if (markSeenOnClose) markSeen();

    overlay.removeAttribute('data-open');
    overlay.inert = true;

    const finish = () => {
      overlay.removeAttribute('data-arm');
      setBackgroundInert(false);
      unlockScroll();
      const toRestore = lastFocused;
      lastFocused = null;
      if (toRestore && typeof toRestore.focus === 'function') toRestore.focus();
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    let done = false;
    const guard = () => {
      if (done) return;
      done = true;
      overlay.removeEventListener('transitionend', onEnd);
      finish();
    };

    const onEnd = (e: TransitionEvent) => {
      if (e.target !== overlay || e.propertyName !== 'opacity') return;
      guard();
    };

    overlay.addEventListener('transitionend', onEnd);
    window.setTimeout(guard, 400);
  };

  const trapFocus = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusables = getFocusable();
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || active === dialog) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const onScrollCheck = () => {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop || 0;
    const viewport = window.innerHeight || doc.clientHeight || 0;
    const scrollHeight = doc.scrollHeight || 0;
    const ratio = scrollHeight > 0 ? (scrollTop + viewport) / scrollHeight : 0;
    if (ratio >= openAtScrollRatio) open();
  };

  const startTriggers = () => {
    if (hasSeen()) return;
    timeoutId = window.setTimeout(open, openAfterMs);
    window.addEventListener('scroll', onScrollCheck, { passive: true });
    requestAnimationFrame(onScrollCheck);
  };

  const cleanupTriggers = () => {
    if (timeoutId != null) window.clearTimeout(timeoutId);
    timeoutId = null;
    window.removeEventListener('scroll', onScrollCheck);
  };

  closeBtn.addEventListener('click', () => close({ markSeenOnClose: true }));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close({ markSeenOnClose: true });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) close({ markSeenOnClose: true });
  });

  dialog.addEventListener('keydown', trapFocus);

  emailInput.addEventListener('input', () => {
    if (emailInput.checkValidity()) hideError();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const accessKeyInput = form.querySelector('input[name="access_key"]');
    const key = accessKeyInput instanceof HTMLInputElement ? accessKeyInput.value.trim() : '';
    if (!key) {
      showError('El formulario no está configurado.');
      return;
    }

    if (!emailInput.checkValidity()) {
      showError(DEFAULT_ERROR);
      emailInput.focus();
      return;
    }

    const fd = new FormData(form);
    const botcheck = String(fd.get('botcheck') || '');
    if (botcheck) {
      showError('No pudimos enviar tu mensaje.');
      return;
    }

    const payload: Record<string, string> = {
      access_key: key,
      email: String(fd.get('email') ?? '').trim(),
      subject: 'Email signup popup — byklika.com',
      message: 'Newsletter / novedades signup (homepage popup).'
    };

    const defaultLabel = submitBtn?.textContent ?? 'Quiero sumarme';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';
    }

    try {
      const { ok, message } = await submitToWeb3Forms(payload);

      if (ok) {
        publish({
          name: 'contact_form_submit',
          params: { form_location: 'popup' }
        });
        formView.classList.add('hidden');
        confirmView.classList.remove('hidden');
        markSeen();
        window.setTimeout(() => close({ markSeenOnClose: false }), autoCloseMs);
      } else {
        showError(message);
        emailInput.focus();
      }
    } catch {
      showError('Error de red. Probá de nuevo.');
      emailInput.focus();
    } finally {
      if (submitBtn && key) {
        submitBtn.disabled = false;
        submitBtn.textContent = defaultLabel;
      }
    }
  });

  startTriggers();
}

import { scheduleDomIdle } from '~/lib/scheduleDomIdle';

scheduleDomIdle(boot);

export {};
