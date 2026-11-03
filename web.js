(() => {
  "use strict";

  const stages = [
    {
      title: "Discovery",
      description:
        "We understand your business, audience, and website goals to define the right pages, features, and content for your custom web solution.",
      deliverables: ["Business goals", "Audience insights", "Website scope"],
      note: "A clear project brief keeps your website aligned with your business.",
      progress: 20,
    },
    {
      title: "Blueprint",
      description:
        "We plan your website structure, responsive layouts, and user journeys, with clear navigation and UI/UX designed around visitor needs.",
      deliverables: ["Sitemap", "Responsive layouts", "UI/UX direction"],
      note: "A thoughtful structure helps visitors explore and take action.",
      progress: 40,
    },
    {
      title: "Build",
      description:
        "We develop your responsive website and connect the agreed features, including CMS tools, e-commerce functionality, and interactive elements.",
      deliverables: ["Responsive pages", "CMS integration", "Custom features"],
      note: "Your approved design becomes a functional, easy-to-manage website.",
      progress: 60,
    },
    {
      title: "Refine",
      description:
        "We review layouts, test key features, and optimize images and code to improve usability, loading performance, and consistency across devices.",
      deliverables: [
        "Device testing",
        "UI/UX refinements",
        "Speed optimization",
      ],
      note: "Final checks help prepare your website for a polished launch.",
      progress: 80,
    },
    {
      title: "Launch",
      description:
        "We publish your approved website, check its live functionality, and provide the agreed handover guidance for content updates and ongoing care.",
      deliverables: ["Deployment", "Live checks", "Website handover"],
      note: "Your website goes live with a clear plan for its next steps.",
      progress: 100,
    },
  ];

  function initializeBlueprint() {
    const section = document.querySelector(".web-build");

    if (!section) return;

    const buttons = [...section.querySelectorAll(".web-build__stage")];
    const panel = section.querySelector(".web-build__detail");
    const title = section.querySelector(".web-build__detail-title");
    const description = section.querySelector(".web-build__detail-description");
    const deliverables = section.querySelector(".web-build__deliverables");
    const note = section.querySelector(".web-build__detail-note p");
    const fill = section.querySelector(".web-build__detail-progress-fill");
    const tablist = section.querySelector(".web-build__stages");

    if (
      !buttons.length ||
      !panel ||
      !title ||
      !description ||
      !deliverables ||
      !note ||
      !fill
    ) {
      return;
    }

    section.querySelectorAll(".web-build__expanded").forEach((element) => {
      element.remove();
    });

    tablist?.setAttribute("aria-orientation", "vertical");

    panel.id ||= "web-build-detail";
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("tabindex", "0");
    panel.classList.remove("is-changing");

    function renderStage(index) {
      const stage = stages[index];

      if (!stage) return;

      buttons.forEach((button) => {
        const active = Number(button.dataset.stage) === index;

        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;

        if (active) {
          panel.setAttribute("aria-labelledby", button.id);
        }
      });

      title.textContent = stage.title;
      description.textContent = stage.description;
      note.textContent = stage.note;
      fill.style.width = `${stage.progress}%`;

      deliverables.replaceChildren(
        ...stage.deliverables.map((text) => {
          const tag = document.createElement("span");
          tag.className = "web-build__deliverable";
          tag.textContent = text;
          return tag;
        }),
      );
    }

    buttons.forEach((button, position) => {
      button.id ||= `web-build-tab-${position}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", panel.id);

      button.addEventListener("click", () => {
        renderStage(Number(button.dataset.stage));
      });

      button.addEventListener("keydown", (event) => {
        let nextPosition;

        switch (event.key) {
          case "ArrowDown":
            nextPosition = (position + 1) % buttons.length;
            break;
          case "ArrowUp":
            nextPosition = (position - 1 + buttons.length) % buttons.length;
            break;
          case "Home":
            nextPosition = 0;
            break;
          case "End":
            nextPosition = buttons.length - 1;
            break;
          default:
            return;
        }

        event.preventDefault();

        const nextButton = buttons[nextPosition];

        nextButton.focus();
        renderStage(Number(nextButton.dataset.stage));
      });
    });

    const initialButton = buttons.find((button) =>
      button.classList.contains("is-active"),
    );

    renderStage(initialButton ? Number(initialButton.dataset.stage) : 0);
  }

  function initializeFAQs() {
    const items = [...document.querySelectorAll(".web-faq__item")];

    items.forEach((item, index) => {
      const question = item.querySelector(".web-faq__question");
      const answer = item.querySelector(".web-faq__answer");

      if (!question || !answer) return;

      question.id ||= `web-faq-question-${index}`;
      answer.id ||= `web-faq-answer-${index}`;

      question.setAttribute("aria-controls", answer.id);
      answer.setAttribute("aria-labelledby", question.id);

      const isOpen = item.classList.contains("is-open");

      question.setAttribute("aria-expanded", String(isOpen));
      answer.setAttribute("aria-hidden", String(!isOpen));

      question.addEventListener("click", () => {
        const shouldOpen = !item.classList.contains("is-open");

        items.forEach((otherItem) => {
          otherItem.classList.remove("is-open");

          otherItem
            .querySelector(".web-faq__question")
            ?.setAttribute("aria-expanded", "false");

          otherItem
            .querySelector(".web-faq__answer")
            ?.setAttribute("aria-hidden", "true");
        });

        if (shouldOpen) {
          item.classList.add("is-open");
          question.setAttribute("aria-expanded", "true");
          answer.setAttribute("aria-hidden", "false");
        }
      });
    });
  }

  function initialize() {
    initializeBlueprint();
    initializeFAQs();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, {
      once: true,
    });
  } else {
    initialize();
  }
})();
