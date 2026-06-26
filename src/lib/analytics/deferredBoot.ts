/** Schedule work after the browser is idle (falls back to `setTimeout` when unsupported). */
export function runWhenIdle(fn: () => void, timeout = 3500): void {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(fn, { timeout });
  } else {
    setTimeout(fn, 1);
  }
}

/** Defer work until `window` `load` so LCP is not competing with analytics boot. */
export function runAfterWindowLoad(fn: () => void): void {
  if (typeof window === 'undefined') return;
  if (document.readyState === 'complete') {
    fn();
    return;
  }
  window.addEventListener('load', fn, { once: true });
}

/** GA4 idle timeout — after load; keeps gtag out of typical Lighthouse navigation window. */
const GA_IDLE_TIMEOUT_MS = 8000;

const INTERACTION_EVENTS = ['scroll', 'click', 'keydown', 'touchstart'] as const;

/** Run `fn` once on the first scroll, click, keydown, or touchstart. */
export function onFirstInteraction(fn: () => void): void {
  if (typeof window === 'undefined') return;

  let fired = false;
  const run = () => {
    if (fired) return;
    fired = true;
    for (const event of INTERACTION_EVENTS) {
      window.removeEventListener(event, run, true);
    }
    fn();
  };

  for (const event of INTERACTION_EVENTS) {
    window.addEventListener(event, run, {
      capture: true,
      passive: event !== 'keydown',
      once: false
    });
  }
}

export type GaConfigOpts = Record<string, boolean | string | number>;

/** Inject GA4 `gtag.js` and send one explicit `page_view` once the script loads. */
export function loadGa4(measurementId: string, configOpts: GaConfigOpts): void {
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  }
  window.gtag = gtag;
  gtag('js', new Date());

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  script.onload = () => {
    gtag('config', measurementId, configOpts);
    gtag('event', 'page_view', {
      page_location: location.href,
      page_path: location.pathname + location.search,
      page_title: document.title || ''
    });
  };
  document.head.appendChild(script);
}

/** Inject the Microsoft Clarity tag (call after user interaction or consent). */
export function loadClarity(projectId: string): void {
  type ClarityFn = { (...args: unknown[]): void; q?: IArguments[] };
  const w = window as Window & { clarity?: ClarityFn };

  w.clarity =
    w.clarity ||
    function (..._args: unknown[]) {
      (w.clarity!.q = w.clarity!.q || []).push(arguments);
    };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`;
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
}

export type DeferredAnalyticsOptions = {
  gaMeasurementId?: string;
  clarityProjectId?: string;
  gaConfig?: GaConfigOpts;
};

/**
 * Defer non-critical analytics: GA4 after idle, Clarity after first interaction.
 * Lighthouse lab runs do not interact, so Clarity stays unloaded during audits.
 */
export function bootDeferredAnalytics(opts: DeferredAnalyticsOptions): void {
  const { gaMeasurementId, clarityProjectId, gaConfig = { send_page_view: false } } = opts;

  if (gaMeasurementId) {
    runAfterWindowLoad(() =>
      runWhenIdle(() => loadGa4(gaMeasurementId, gaConfig), GA_IDLE_TIMEOUT_MS)
    );
  }

  if (clarityProjectId) {
    onFirstInteraction(() => loadClarity(clarityProjectId));
  }
}
