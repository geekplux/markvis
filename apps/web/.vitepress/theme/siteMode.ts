/** Site chrome light|dark — not fence chart theme. */

export type SiteMode = "light" | "dark";

export const SITE_MODE_KEY = "markvis-site-mode";

const SUN_SVG =
  '<svg class="home-nav-mode-icon home-nav-mode-sun" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><circle cx="9" cy="9" r="3.25" fill="none" stroke="currentColor" stroke-width="1.75"/><path d="M9 1.5v2.25M9 14.25V16.5M1.5 9h2.25M14.25 9H16.5M3.7 3.7l1.6 1.6M12.7 12.7l1.6 1.6M14.3 3.7l-1.6 1.6M5.3 12.7l-1.6 1.6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square"/></svg>';

const MOON_SVG =
  '<svg class="home-nav-mode-icon home-nav-mode-moon" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M14.5 10.2A5.75 5.75 0 0 1 7.8 3.5 5.75 5.75 0 1 0 14.5 10.2Z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/></svg>';

export function readStoredMode(): SiteMode | null {
  try {
    const v = localStorage.getItem(SITE_MODE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* ignore */
  }
  return null;
}

export function systemMode(): SiteMode {
  try {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
  } catch {
    /* ignore */
  }
  return "dark";
}

export function currentMode(): SiteMode {
  const root = document.documentElement;
  if (root.classList.contains("light")) return "light";
  if (root.classList.contains("dark")) return "dark";
  return systemMode();
}

/** Target mode + visible glyph: dark→sun (to light), light→moon (to dark). */
export function toggleAriaLabel(mode: SiteMode): string {
  return mode === "dark" ? "Switch to light mode" : "Switch to dark mode";
}

export function applySiteMode(mode: SiteMode): void {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(mode);
  try {
    localStorage.setItem(SITE_MODE_KEY, mode);
  } catch {
    /* ignore */
  }
  syncModeToggle(mode);
}

export function toggleSiteMode(): SiteMode {
  const next: SiteMode = currentMode() === "dark" ? "light" : "dark";
  applySiteMode(next);
  return next;
}

export function syncModeToggle(mode: SiteMode = currentMode()): void {
  const label = toggleAriaLabel(mode);
  const glyph = mode === "dark" ? SUN_SVG : MOON_SVG;
  for (const el of document.querySelectorAll("[data-site-mode-toggle]")) {
    if (!(el instanceof HTMLElement)) continue;
    el.setAttribute("aria-label", label);
    el.setAttribute("data-mode", mode);
    el.innerHTML = glyph;
  }
}

export function initSiteMode(): void {
  const stored = readStoredMode();
  applySiteMode(stored ?? systemMode());
  if ((initSiteMode as { bound?: boolean }).bound) return;
  (initSiteMode as { bound?: boolean }).bound = true;
  document.addEventListener("click", (event) => {
    const t = event.target;
    if (!(t instanceof Element)) return;
    if (!t.closest("[data-site-mode-toggle]")) return;
    event.preventDefault();
    toggleSiteMode();
  });
}
