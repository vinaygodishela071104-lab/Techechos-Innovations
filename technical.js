(() => {
  "use strict";

  const remoteContent = [
    {
      title: "Understand the issue",
      description:
        "Review the reported symptoms and identify the affected application.",
    },
    {
      title: "Review the environment",
      description:
        "Inspect relevant settings and behavior within the authorized support scope.",
    },
    {
      title: "Confirm and document",
      description:
        "Check the observed outcome and record any remaining actions or escalation.",
    },
  ];

  const networkContent = {
    workstations:
      "Workstations: review the affected device and its connection to supported network services.",

    wifi: "Wi-Fi: investigate the affected connection, signal conditions, and supported access settings.",

    resources:
      "Shared resources: review access to supported folders and services, including relevant permissions.",

    applications:
      "Applications: investigate service access and identify whether further provider or infrastructure escalation is needed.",
  };

  function initializeTechnicalSupportPage() {
    const page = document.querySelector(".tech-page");

    if (!page || page.dataset.techInitialized === "true") {
      return;
    }

    page.dataset.techInitialized = "true";

    initializeRemotePreview(page);
    initializeNetworkPreview(page);
  }

  function initializeRemotePreview(page) {
    const controls = Array.from(page.querySelectorAll("[data-remote]"));

    const title = page.querySelector("#tech-remote-preview-title");
    const description = page.querySelector("#tech-remote-preview-text");

    if (!controls.length || !title || !description) {
      return;
    }

    const previewBody = title.closest(".tech-app-window__body");

    function selectCheckpoint(index, animate = true) {
      const content = remoteContent[index];

      if (!content) {
        return;
      }

      controls.forEach((control) => {
        const active = Number(control.dataset.remote) === index;

        control.setAttribute("aria-pressed", String(active));
        control.classList.toggle("is-active", active);
      });

      title.textContent = content.title;
      description.textContent = content.description;

      animatePreview(previewBody, animate);
    }

    controls.forEach((control) => {
      control.addEventListener("click", () => {
        selectCheckpoint(Number(control.dataset.remote));
      });
    });

    selectCheckpoint(0, false);
  }

  function initializeNetworkPreview(page) {
    const nodes = Array.from(page.querySelectorAll(".tech-network-node"));

    const lines = Array.from(page.querySelectorAll("[data-line]"));

    const caption = page.querySelector("#tech-network-caption");

    if (!nodes.length || !caption) {
      return;
    }

    function selectNode(key) {
      const content = networkContent[key];

      if (!content) {
        return;
      }

      nodes.forEach((node) => {
        const active = node.dataset.node === key;
        node.setAttribute("aria-pressed", String(active));
      });

      lines.forEach((line) => {
        line.classList.toggle("is-active", line.dataset.line === key);
      });

      caption.textContent = content;
    }

    nodes.forEach((node) => {
      node.addEventListener("click", () => {
        selectNode(node.dataset.node);
      });
    });

    selectNode("workstations");
  }

  function animatePreview(element, enabled) {
    if (
      !element ||
      !enabled ||
      typeof element.animate !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    element.getAnimations().forEach((animation) => {
      animation.cancel();
    });

    element.animate(
      [
        {
          opacity: 0.45,
          transform: "translateY(4px)",
        },
        {
          opacity: 1,
          transform: "translateY(0)",
        },
      ],
      {
        duration: 220,
        easing: "ease-out",
      },
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeTechnicalSupportPage,
      { once: true },
    );
  } else {
    initializeTechnicalSupportPage();
  }
})();
