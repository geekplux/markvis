/** Site chrome light|dark — not fence chart theme. */

export type SiteMode = "light" | "dark";

export const SITE_MODE_KEY = "markvis-site-mode";

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

export function applySiteMode(mode: SiteMode): void {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(mode);
  try {
    localStorage.setItem(SITE_MODE_KEY, mode);
  } catch {
    /* ignore */
  }
  syncModeToggleLabels(mode);
}

export function toggleSiteMode(): SiteMode {
  const next: SiteMode = currentMode() === "dark" ? "light" : "dark";
  applySiteMode(next);
  return next;
}

/** Label shows the mode you switch *to*. */
export function toggleLabel(mode: SiteMode): string {
  return mode === "dark" ? "Light" : "Dark";
}

export function syncModeToggleLabels(mode: SiteMode = currentMode()): void {
  const label = toggleLabel(mode);
  for (const el of document.querySelectorAll("[data-site-mode-toggle]")) {
    el.textContent = label;
    if (el instanceof HTMLElement) {
      el.setAttribute("aria-label", `Switch to ${label} mode`);
    }
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
