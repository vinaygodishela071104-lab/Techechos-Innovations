(() => {
  "use strict";

  function initializeSapSdPage() {
    const page = document.querySelector(".sd-page");

    if (!page || page.dataset.sdInitialized === "true") {
      return;
    }

    page.dataset.sdInitialized = "true";

    page.querySelectorAll("[data-sd-tabs]").forEach(initializeTabs);

    const diagnostics = Array.from(
      page.querySelectorAll(".sd-diagnostic")
    );

    diagnostics.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) {
          return;
        }

        diagnostics.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.open = false;
          }
        });
      });
    });
  }

  function initializeTabs(group) {
    const tablist = group.querySelector('[role="tablist"]');

    if (!tablist) {
      return;
    }

    const tabs = Array.from(
      tablist.querySelectorAll('[role="tab"]')
    );

    const panels = Array.from(
      group.querySelectorAll('[role="tabpanel"]')
    );

    function activateTab(index, moveFocus = false, animate = true) {
      const selectedTab = tabs[index];

      if (!selectedTab) {
        return;
      }

      const panelId = selectedTab.getAttribute("aria-controls");

      const selectedPanel = panels.find(
        (panel) => panel.id === panelId
      );

      if (!selectedPanel) {
        return;
      }

      tabs.forEach((tab, tabIndex) => {
        const selected = tabIndex === index;

        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });

      panels.forEach((panel) => {
        if (typeof panel.getAnimations === "function") {
          panel.getAnimations().forEach((animation) => {
            animation.cancel();
          });
        }

        panel.hidden = panel !== selectedPanel;
      });

      if (moveFocus) {
        selectedTab.focus();
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
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
              transform: "translateY(5px)"
            },
            {
              opacity: 1,
              transform: "translateY(0)"
            }
          ],
          {
            duration: 220,
            easing: "ease-out"
          }
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

    const selectedIndex = tabs.findIndex(
      (tab) => tab.getAttribute("aria-selected") === "true"
    );

    activateTab(
      selectedIndex >= 0 ? selectedIndex : 0,
      false,
      false
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeSapSdPage,
      { once: true }
    );
  } else {
    initializeSapSdPage();
  }
})();