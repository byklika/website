const STORAGE_KEY = 'klika_project_stage_v1';

function normalizeStage(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function setStoredStage(stage: string) {
  const normalized = normalizeStage(stage);
  if (!normalized) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, normalized);
  } catch {
    // ignore storage failures (private mode, blocked storage, etc.)
  }
}

function getStoredStage() {
  try {
    return normalizeStage(sessionStorage.getItem(STORAGE_KEY) ?? '');
  } catch {
    return '';
  }
}

function clearStoredStage() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function getContactSheetStageInput() {
  const form = document.getElementById('contact-sheet-form');
  if (!(form instanceof HTMLFormElement)) return null;

  const input = form.querySelector('input[name="project_stage"]');
  return input instanceof HTMLInputElement ? input : null;
}

function setContactSheetStage(stage: string) {
  const input = getContactSheetStageInput();
  if (!input) return;

  input.value = normalizeStage(stage);
}

function applyStoredStageToContactSheetForm() {
  const stage = getStoredStage();
  if (!stage) return;

  setContactSheetStage(stage);
}

function isServicesStageButton(el: Element) {
  if (!(el instanceof HTMLButtonElement)) return false;
  if (!el.classList.contains('text-klika-moss')) return false;
  if (!el.classList.contains('js-tab')) return false;
  const servicesSection = el.closest('#servicios');
  return Boolean(servicesSection);
}

document.addEventListener('click', (e) => {
  const target = e.target instanceof Element ? e.target : null;
  if (!target) return;

  const stageBtn = target.closest('button.text-klika-moss');
  if (stageBtn && isServicesStageButton(stageBtn)) {
    const text = stageBtn.textContent ?? '';
    setStoredStage(text);
  }

  const sheetTrigger = target.closest('[data-sheet-open="contact-sheet"]');
  if (sheetTrigger) {
    const shouldPreserveStage = sheetTrigger.getAttribute('data-project-stage-source') === 'service-card';
    if (shouldPreserveStage) {
      const stageValue = normalizeStage(sheetTrigger.getAttribute('data-project-stage-value') ?? '');
      if (stageValue) {
        setStoredStage(stageValue);
        setContactSheetStage(stageValue);
      } else {
        // Fallback: for old markup / other service-card openers.
        applyStoredStageToContactSheetForm();
      }
    } else {
      clearStoredStage();
      setContactSheetStage('');
    }
  }
});

// Clear the stored stage after a successful submit (ContactForm calls form.reset()).
window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-sheet-form');
  if (!(form instanceof HTMLFormElement)) return;

  form.addEventListener('reset', () => {
    clearStoredStage();
  });
});

