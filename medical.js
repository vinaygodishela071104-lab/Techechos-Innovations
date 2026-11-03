(() => {
  "use strict";

  function initializeMedicalCodingPage() {
    const page = document.querySelector(".medical-page");

    if (!page || page.dataset.medicalInitialized === "true") {
      return;
    }

    page.dataset.medicalInitialized = "true";

    const tablist = page.querySelector(".medical-audit-tabs");

    if (!tablist) {
      return;
    }

    const tabs = Array.from(tablist.querySelectorAll(".medical-audit-tab"));

    const panels = Array.from(page.querySelectorAll(".medical-audit-panel"));

    if (!tabs.length || !panels.length) {
      return;
    }

    function activateTab(index, moveFocus = false, animate = true) {
      const selectedTab = tabs[index];

      if (!selectedTab) {
        return;
      }

      const panelId = selectedTab.getAttribute("aria-controls");

      const selectedPanel = panels.find((panel) => panel.id === panelId);

      if (!selectedPanel) {
        return;
      }

      panels.forEach((panel) => {
        if (typeof panel.getAnimations === "function") {
          panel.getAnimations().forEach((animation) => {
            animation.cancel();
          });
        }

        panel.hidden = panel !== selectedPanel;
      });

      tabs.forEach((tab, tabIndex) => {
        const active = tabIndex === index;

        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });

      if (moveFocus) {
        selectedTab.focus();
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (
        animate &&
        !reduceMotion &&
        typeof selectedPanel.animate === "function"
      ) {
        selectedPanel.animate(
          [
            {
              opacity: 0,
              transform: "translateY(6px)",
            },
            {
              opacity: 1,
              transform: "translateY(0)",
            },
          ],
          {
            duration: 230,
            easing: "ease-out",
          },
        );
      }
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        activateTab(index);
      });

      tab.addEventListener("keydown", (event) => {
        let nextIndex;

        switch (event.key) {
          case "ArrowRight":
            nextIndex = (index + 1) % tabs.length;
            break;

          case "ArrowLeft":
            nextIndex = (index - 1 + tabs.length) % tabs.length;
            break;

          case "Home":
            nextIndex = 0;
            break;

          case "End":
            nextIndex = tabs.length - 1;
            break;

          default:
            return;
        }

        event.preventDefault();
        activateTab(nextIndex, true);
      });
    });

    const initialIndex = tabs.findIndex(
      (tab) => tab.getAttribute("aria-selected") === "true",
    );

    activateTab(initialIndex >= 0 ? initialIndex : 0, false, false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMedicalCodingPage, {
      once: true,
    });
  } else {
    initializeMedicalCodingPage();
  }
})();
