(() => {
  "use strict";

  const costDescriptions = {
    centers:
      "Cost Centers: review the organizational structures and assignments used to understand costs.",
    orders:
      "Internal Orders: review agreed cost collection and analysis for defined activities or initiatives.",
    profitability:
      "Profitability Analysis: review agreed dimensions and information used for internal profitability analysis."
  };

  function initializeFicoPage() {
    const page = document.querySelector(".fico-page");

    if (!page || page.dataset.ficoInitialized === "true") {
      return;
    }

    page.dataset.ficoInitialized = "true";

    initializeCostControls(page);
    initializeReviewTabs(page);
  }

  function initializeCostControls(page) {
    const controls = Array.from(
      page.querySelectorAll("[data-fico-cost]")
    );

    const caption = page.querySelector("#fico-cost-caption");

    if (!controls.length || !caption) {
      return;
    }

    function selectCostArea(key) {
      const description = costDescriptions[key];

      if (!description) {
        return;
      }

      controls.forEach((control) => {
        control.setAttribute(
          "aria-pressed",
          String(control.dataset.ficoCost === key)
        );
      });

      caption.textContent = description;
    }

    controls.forEach((control) => {
      control.addEventListener("click", () => {
        selectCostArea(control.dataset.ficoCost);
      });
    });

    selectCostArea("centers");
  }

  function initializeReviewTabs(page) {
    const tablist = page.querySelector(".fico-review-register");

    if (!tablist) {
      return;
    }

    const tabs = Array.from(
      tablist.querySelectorAll('[role="tab"]')
    );

    const panels = Array.from(
      page.querySelectorAll(".fico-review-sheet")
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
        const active = tabIndex === index;

        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
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
          case "ArrowDown":
            nextIndex = (index + 1) % tabs.length;
            break;

          case "ArrowUp":
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
      (tab) => tab.getAttribute("aria-selected") === "true"
    );

    activateTab(
      initialIndex >= 0 ? initialIndex : 0,
      false,
      false
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeFicoPage,
      { once: true }
    );
  } else {
    initializeFicoPage();
  }
})();