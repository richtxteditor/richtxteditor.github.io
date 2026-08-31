const VIEW_IDS = ["home", "work", "about", "contact"];

function viewFromHash() {
  const requested = window.location.hash.slice(1);
  return VIEW_IDS.includes(requested) ? requested : "home";
}

export function initCurrentYear() {
  const year = document.getElementById("year");
  if (!year) return;

  const currentYear = String(new Date().getFullYear());
  year.textContent = currentYear;
  year.setAttribute("datetime", currentYear);
}

export function initViewNavigation() {
  const panels = Array.from(document.querySelectorAll("[data-view-panel]"));
  const links = Array.from(document.querySelectorAll("[data-view-link]"));
  const navLinks = Array.from(
    document.querySelectorAll(".nav-links [data-view-link]"),
  );

  if (!panels.length || !links.length) return;

  function activate(view, moveFocus = false) {
    const selectedView = VIEW_IDS.includes(view) ? view : "home";

    panels.forEach((panel) => {
      const isActive = panel.dataset.viewPanel === selectedView;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);

      if (isActive && moveFocus) {
        panel.querySelector("h1, h2")?.focus({ preventScroll: true });
      }
    });

    navLinks.forEach((link) => {
      if (link.dataset.viewLink === selectedView) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    document.title =
      selectedView === "home"
        ? "John Molina | Software Engineer in New Jersey"
        : `${selectedView[0].toUpperCase()}${selectedView.slice(1)} | John Molina`;
  }

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const view = link.dataset.viewLink;
      if (!VIEW_IDS.includes(view)) return;

      event.preventDefault();
      window.history.pushState(null, "", `#${view}`);
      activate(view, true);
    });
  });

  window.addEventListener("popstate", () => activate(viewFromHash()));
  window.addEventListener("hashchange", () => activate(viewFromHash()));
  activate(viewFromHash());
}
