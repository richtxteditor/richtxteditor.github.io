const THEME_KEY = "theme";

function readStoredTheme() {
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch (_error) {
    return null;
  }
}

function getSystemTheme() {
  const darkScheme = window.matchMedia?.("(prefers-color-scheme: dark)");
  if (!darkScheme) return "dark";
  return darkScheme.matches ? "dark" : "light";
}

function getAppliedTheme() {
  const explicit = document.documentElement.dataset.theme;
  return explicit === "light" || explicit === "dark"
    ? explicit
    : getSystemTheme();
}

function followSystem() {
  delete document.documentElement.dataset.theme;
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

export function initAppearance() {
  const button = document.getElementById("theme-toggle");
  if (!button) return;

  function syncToggleLabel() {
    const nextTheme = getAppliedTheme() === "dark" ? "light" : "dark";
    button.setAttribute("aria-label", `Use ${nextTheme} theme`);
  }

  function applyOverride(theme) {
    applyTheme(theme);
    syncToggleLabel();
  }

  function clearOverride() {
    followSystem();
    syncToggleLabel();
  }

  button.addEventListener("click", () => {
    const nextTheme = getAppliedTheme() === "dark" ? "light" : "dark";
    if (nextTheme === getSystemTheme()) {
      clearOverride();
      try {
        window.localStorage.removeItem(THEME_KEY);
      } catch (_error) {
        // Following the system theme for this page view is enough.
      }
      return;
    }

    applyOverride(nextTheme);

    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch (_error) {
      // The selected theme still applies for this page view.
    }
  });

  const colorScheme = window.matchMedia?.("(prefers-color-scheme: dark)");
  colorScheme?.addEventListener?.("change", () => {
    if (!readStoredTheme()) clearOverride();
  });

  const stored = readStoredTheme();
  if (stored) applyOverride(stored);
  else clearOverride();
}
