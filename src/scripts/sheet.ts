import { publish } from '~/lib/analytics/bus';

type SheetConfig = {
  closeOnOverlayClick: boolean;
  closeOnEsc: boolean;
};

/** GA4: where the user clicked to open the contact sheet. */
function inferContactCtaPlacement(trigger: HTMLElement): string {
  if (trigger.closest('#homeHeader')) return 'header';
  if (trigger.closest('footer')) return 'footer';
  if (trigger.closest('.cta-component')) return 'cta_block';
  if (trigger.closest('.service-card-component')) return 'service_card';
  if (trigger.closest('.blog-article-card')) return 'blog_card';
  if (trigger.closest('#servicios')) return 'servicios';
  if (trigger.closest('main')) return 'main';
  return 'other';
}

function trackContactSheetOpened(trigger: HTMLElement, sheetId: string) {
  publish({
    name: 'contact_cta_click',
    params: {
      placement: inferContactCtaPlacement(trigger),
      sheet_id: sheetId
    }
  });
}

type BackgroundElSnapshot = {
  el: HTMLElement;
  ariaHidden: string | null;
  inert: boolean | null;
};

function readConfig(sheetRoot: HTMLElement): SheetConfig {
  const closeOnOverlayClick = sheetRoot.dataset.closeOnOverlayClick !== 'false';
  const closeOnEsc = sheetRoot.dataset.closeOnEsc !== 'false';
  return { closeOnOverlayClick, closeOnEsc };
}

function getFocusable(container: HTMLElement) {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];
  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(','))).filter((node) => {
    return !node.hasAttribute('disabled') && node.getAttribute('aria-hidden') !== 'true';
  });
}

function boot() {
  const sheets = Array.from(document.querySelectorAll<HTMLElement>('[data-sheet-root]'));
  if (!sheets.length) return;

  const sheetById = new Map<string, HTMLElement>();
  for (const sheet of sheets) {
    if (sheet.id) sheetById.set(sheet.id, sheet);
  }

  let activeSheet: HTMLElement | null = null;
  let lastFocused: HTMLElement | null = null;
  let prevDocOverflow = '';
  let backgroundEls: BackgroundElSnapshot[] = [];

  const isOpen = (sheet: HTMLElement) => sheet.hasAttribute('data-open');

  const lockScroll = () => {
    prevDocOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
  };

  const unlockScroll = () => {
    document.documentElement.style.overflow = prevDocOverflow;
  };

  const setBackgroundInert = (enabled: boolean, overlayEl: HTMLElement) => {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const main = document.querySelector('main');
    const candidates: HTMLElement[] = [];

    if (header) candidates.push(header as HTMLElement);
    if (footer) candidates.push(footer as HTMLElement);
    if (main) {
      for (const child of Array.from(main.children)) {
        if (child === overlayEl) continue;
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

  const finishClose = (sheet: HTMLElement, { restoreFocus }: { restoreFocus: boolean }) => {
    sheet.removeAttribute('data-arm');
    setBackgroundInert(false, sheet);
    unlockScroll();

    activeSheet = null;

    const toRestore = restoreFocus ? lastFocused : null;
    lastFocused = null;
    if (toRestore && typeof toRestore.focus === 'function') toRestore.focus();
  };

  const close = (sheet: HTMLElement, { restoreFocus = true }: { restoreFocus?: boolean } = {}) => {
    if (!isOpen(sheet)) return;

    sheet.removeAttribute('data-open');
    sheet.inert = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishClose(sheet, { restoreFocus });
      return;
    }

    let done = false;
    const guard = () => {
      if (done) return;
      done = true;
      sheet.removeEventListener('transitionend', onEnd);
      finishClose(sheet, { restoreFocus });
    };

    const onEnd = (e: TransitionEvent) => {
      if (e.target !== sheet || e.propertyName !== 'opacity') return;
      guard();
    };

    sheet.addEventListener('transitionend', onEnd);
    window.setTimeout(guard, 400);
  };

  const open = (sheet: HTMLElement) => {
    if (activeSheet && activeSheet !== sheet) {
      close(activeSheet, { restoreFocus: false });
    }

    if (isOpen(sheet)) return;

    const panel = sheet.querySelector<HTMLElement>('[data-sheet-panel]');
    if (!panel) return;

    lastFocused = document.activeElement as HTMLElement | null;
    activeSheet = sheet;

    lockScroll();
    setBackgroundInert(true, sheet);

    sheet.inert = false;
    sheet.setAttribute('data-arm', '');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        sheet.setAttribute('data-open', '');

        const preferred =
          panel.querySelector<HTMLElement>('[data-sheet-close]') ?? getFocusable(panel)[0] ?? panel;
        preferred.focus();
      });
    });
  };

  const trapFocus = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    if (!activeSheet) return;

    const panel = activeSheet.querySelector<HTMLElement>('[data-sheet-panel]');
    if (!panel) return;

    const focusables = getFocusable(panel);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || active === panel) {
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

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const openEl = target.closest<HTMLElement>('[data-sheet-open]');
    if (openEl) {
      const id = openEl.getAttribute('data-sheet-open')?.trim();
      if (!id) return;
      const sheet = sheetById.get(id) ?? document.getElementById(id);
      if (!(sheet instanceof HTMLElement)) return;
      const wasClosed = !isOpen(sheet);
      open(sheet);
      if (wasClosed && id === 'contact-sheet') {
        queueMicrotask(() => {
          if (!isOpen(sheet)) return;
          trackContactSheetOpened(openEl, id);
        });
      }
      return;
    }

    const overlayClick = target.closest<HTMLElement>('[data-sheet-overlay]');
    if (overlayClick) {
      const sheet = overlayClick.closest<HTMLElement>('[data-sheet-root]');
      if (!sheet) return;
      const cfg = readConfig(sheet);
      if (cfg.closeOnOverlayClick) close(sheet, { restoreFocus: true });
      return;
    }

    const closeEl = target.closest<HTMLElement>('[data-sheet-close]');
    if (closeEl) {
      const sheet = closeEl.closest<HTMLElement>('[data-sheet-root]');
      if (sheet) close(sheet, { restoreFocus: true });
      return;
    }

    const overlayEl = target.closest<HTMLElement>('[data-sheet-root]');
    if (overlayEl && target === overlayEl) {
      const cfg = readConfig(overlayEl);
      if (cfg.closeOnOverlayClick) close(overlayEl, { restoreFocus: true });
    }
  });

  window.addEventListener('keydown', (e) => {
    if (!activeSheet) return;

    if (e.key === 'Escape') {
      const cfg = readConfig(activeSheet);
      if (cfg.closeOnEsc) close(activeSheet, { restoreFocus: true });
    }
  });

  document.addEventListener('keydown', trapFocus);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export {};
