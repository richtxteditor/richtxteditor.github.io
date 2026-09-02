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
  return window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function getAppliedTheme() {
  const explicit = document.documentElement.dataset.theme;
  return explicit === "light" || explicit === "dark"
    ? explicit
    : getSystemTheme();
}

export function initAppearance() {
  const button = document.getElementById("theme-toggle");
  if (!button) return;

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const nextTheme = theme === "dark" ? "light" : "dark";
    button.setAttribute("aria-label", `Use ${nextTheme} theme`);
  }

  button.addEventListener("click", () => {
    const nextTheme = getAppliedTheme() === "dark" ? "light" : "dark";
    applyTheme(nextTheme);

    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch (_error) {
      // The selected theme still applies for this page view.
    }
  });

  const colorScheme = window.matchMedia?.("(prefers-color-scheme: light)");
  colorScheme?.addEventListener?.("change", () => {
    if (!readStoredTheme()) applyTheme(getSystemTheme());
  });

  applyTheme(readStoredTheme() || getSystemTheme());
}
