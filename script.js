const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
const year = document.querySelector("[data-year]");

if (year) {
  year.textContent = new Date().getFullYear();
}

function activateTab(tab, shouldScroll = true) {
  if (!tab) return;

  tabs.forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === tab.getAttribute("aria-controls"));
  });

  const sectionId = tab.getAttribute("aria-controls");
  if (sectionId) {
    history.replaceState(null, "", `#${sectionId}`);
  }

  if (shouldScroll) {
    document.querySelector(".content-layout")?.scrollIntoView({ block: "start", behavior: "smooth" });
  }
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab));

  tab.addEventListener("keydown", (event) => {
    const index = tabs.indexOf(tab);
    const nextKey = event.key === "ArrowDown" || event.key === "ArrowRight";
    const prevKey = event.key === "ArrowUp" || event.key === "ArrowLeft";

    if (!nextKey && !prevKey) return;

    event.preventDefault();
    const nextIndex = nextKey ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
    tabs[nextIndex].focus();
    activateTab(tabs[nextIndex]);
  });
});

document.querySelectorAll("[data-open-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(`tab-${button.dataset.openTab}`);
    activateTab(target);
    target?.focus();
  });
});

const initialPanel = window.location.hash.replace("#", "");
if (initialPanel) {
  const initialTab = tabs.find((tab) => tab.getAttribute("aria-controls") === initialPanel);
  activateTab(initialTab, false);
}
