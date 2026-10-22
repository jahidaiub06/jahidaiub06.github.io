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


// Lightweight animated network background shared by the homepage and portfolio.
const networkCanvas = document.querySelector("[data-network-background]");
if (networkCanvas) {
  const networkContext = networkCanvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let networkPoints = [];
  let networkWidth = 0;
  let networkHeight = 0;
  let networkFrame = 0;

  function resizeNetworkCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    networkWidth = networkCanvas.parentElement.clientWidth;
    networkHeight = networkCanvas.parentElement.clientHeight;
    networkCanvas.width = Math.round(networkWidth * ratio);
    networkCanvas.height = Math.round(networkHeight * ratio);
    networkContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    const pointCount = Math.min(48, Math.max(20, Math.round((networkWidth * networkHeight) / 32000)));
    networkPoints = Array.from({ length: pointCount }, () => {
      const driftX = 10 + Math.random() * 16;
      const driftY = 7 + Math.random() * 11;
      return {
        originX: driftX + Math.random() * Math.max(0, networkWidth - driftX * 2),
        originY: driftY + Math.random() * Math.max(0, networkHeight - driftY * 2),
        x: 0,
        y: 0,
        driftX,
        driftY,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        speedX: 0.00032 + Math.random() * 0.00020,
        speedY: 0.00028 + Math.random() * 0.00018,
        warm: Math.random() > 0.82
      };
    });
  }

  function drawNetwork(timestamp = 0) {
    networkContext.clearRect(0, 0, networkWidth, networkHeight);
    for (let i = 0; i < networkPoints.length; i += 1) {
      const point = networkPoints[i];
      point.x = reducedMotion
        ? point.originX
        : point.originX + Math.sin(timestamp * point.speedX + point.phaseX) * point.driftX;
      point.y = reducedMotion
        ? point.originY
        : point.originY + Math.sin(timestamp * point.speedY + point.phaseY) * point.driftY;
      for (let j = i + 1; j < networkPoints.length; j += 1) {
        const other = networkPoints[j];
        const dx = point.x - other.x;
        const dy = point.y - other.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 190) {
          networkContext.beginPath();
          networkContext.moveTo(point.x, point.y);
          networkContext.lineTo(other.x, other.y);
          networkContext.strokeStyle = `rgba(95, 205, 224, ${(1 - distance / 190) * 0.28})`;
          networkContext.lineWidth = 1;
          networkContext.stroke();
        }
      }
      networkContext.beginPath();
      networkContext.arc(point.x, point.y, point.warm ? 4.4 : 3.3, 0, Math.PI * 2);
      networkContext.fillStyle = point.warm ? "rgba(244, 190, 91, 0.82)" : "rgba(103, 222, 216, 0.82)";
      networkContext.shadowColor = point.warm ? "rgba(244, 190, 91, 0.55)" : "rgba(79, 213, 230, 0.60)";
      networkContext.shadowBlur = point.warm ? 24 : 19;
      networkContext.fill();
    }
    networkContext.shadowBlur = 0;
    if (!reducedMotion) networkFrame = window.requestAnimationFrame(drawNetwork);
  }

  resizeNetworkCanvas();
  drawNetwork();
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(networkFrame);
    resizeNetworkCanvas();
    drawNetwork();
  }, { passive: true });
}
