(() => {
  "use strict";

  function initializeAppPage() {
    const page = document.querySelector(".app-page");

    if (!page || page.dataset.appInitialized === "true") {
      return;
    }

    page.dataset.appInitialized = "true";

    initializeAppPreview(page);
    initializeOfflinePreview(page);
  }

  function initializeAppPreview(page) {
    const tabs = Array.from(page.querySelectorAll(".app-tab"));
    const panels = Array.from(page.querySelectorAll(".app-preview-panel"));

    const caption = page.querySelector(".app-experience__caption");

    if (!tabs.length || !panels.length) {
      return;
    }

    function activateTab(index, moveFocus = false, animate = true) {
      const selectedTab = tabs[index];

      if (!selectedTab) {
        return;
      }

      const panelId = selectedTab.getAttribute("aria-controls");

      const activePanel = panels.find((panel) => panel.id === panelId);

      if (!activePanel) {
        return;
      }

      tabs.forEach((tab, tabIndex) => {
        const isActive = tabIndex === index;

        tab.setAttribute("aria-selected", String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });

      panels.forEach((panel) => {
        panel.hidden = panel !== activePanel;
      });

      if (caption) {
        caption.textContent = activePanel.dataset.caption || "";
      }

      if (moveFocus) {
        selectedTab.focus();
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (
        animate &&
        !reduceMotion &&
        typeof activePanel.animate === "function"
      ) {
        activePanel.getAnimations().forEach((animation) => {
          animation.cancel();
        });

        activePanel.animate(
          [
            {
              opacity: 0,
              transform: "translateY(7px)",
            },
            {
              opacity: 1,
              transform: "translateY(0)",
            },
          ],
          {
            duration: 240,
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

    const selectedIndex = tabs.findIndex(
      (tab) => tab.getAttribute("aria-selected") === "true",
    );

    activateTab(selectedIndex >= 0 ? selectedIndex : 0, false, false);
  }

  function initializeOfflinePreview(page) {
    const toggle = page.querySelector("#app-offline-switch");
    const demo = page.querySelector("#app-offline-demo");
    const status = page.querySelector("#app-connection-status");
    const syncStatus = page.querySelector("#app-sync-status");

    if (!toggle || !demo || !status || !syncStatus) {
      return;
    }

    function renderOfflineState(isOffline) {
      toggle.setAttribute("aria-checked", String(isOffline));
      demo.classList.toggle("is-offline", isOffline);

      status.textContent = isOffline
        ? "Preview: Offline"
        : "Preview: Connected";

      syncStatus.textContent = isOffline
        ? "Preview: saved content stays available. Draft changes wait to sync."
        : "Preview: selected content is synced.";
    }

    toggle.addEventListener("click", () => {
      const isOffline = toggle.getAttribute("aria-checked") !== "true";

      renderOfflineState(isOffline);
    });

    renderOfflineState(toggle.getAttribute("aria-checked") === "true");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAppPage, {
      once: true,
    });
  } else {
    initializeAppPage();
  }
})();
