export function initProjectPreviews() {
  const links = Array.from(document.querySelectorAll("[data-project-preview]"));
  const visuals = Array.from(document.querySelectorAll("[data-project-visual]"));

  if (!links.length || !visuals.length) return;

  function activatePreview(projectId) {
    visuals.forEach((visual) => {
      visual.hidden = visual.dataset.projectVisual !== projectId;
    });
  }

  links.forEach((link) => {
    const projectId = link.dataset.projectPreview;
    link.addEventListener("pointerenter", () => activatePreview(projectId));
    link.addEventListener("focus", () => activatePreview(projectId));
  });
}
