const STORAGE_KEY = 'klika_project_stage';

function setStage(stage: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, stage);
  } catch {
    // ignore storage failures (private mode, denied, etc.)
  }
}

function getStage() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function applyStageToForms(stage: string) {
  const value = stage.trim();
  const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="project_stage"]'));
  for (const input of inputs) input.value = value;
}

function boot() {
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const stageBtn = target.closest<HTMLElement>('#servicios button.js-tab');
      if (stageBtn) {
        const label = (stageBtn.textContent ?? '').trim();
        if (label) setStage(label);
        return;
      }

      const openContact = target.closest<HTMLElement>('[data-sheet-open="contact-sheet"]');
      if (openContact) {
        const stage = getStage();
        if (stage) applyStageToForms(stage);
      }
    },
    { capture: true }
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

