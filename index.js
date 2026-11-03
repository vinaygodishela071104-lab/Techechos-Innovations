function initializeReviewSliders() {
  document.querySelectorAll(".tech-reviews__slider").forEach((slider) => {
    if (slider.dataset.initialized === "true") return;

    const slides = Array.from(
      slider.querySelectorAll(".tech-reviews__slide")
    );
    const selectors = Array.from(
      slider.querySelectorAll("[data-review-select]")
    );
    const previous = slider.querySelector("[data-review-prev]");
    const next = slider.querySelector("[data-review-next]");
    const currentLabel = slider.querySelector("[data-review-current]");
    const totalLabel = slider.querySelector("[data-review-total]");
    const status = slider.querySelector("[data-review-status]");

    if (!slides.length || !previous || !next) return;

    slider.dataset.initialized = "true";

    let current = 0;
    let touchStart = null;

    const formatNumber = (value) => String(value).padStart(2, "0");

    function showSlide(index, announce = true) {
      current = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === current;

        slide.hidden = !active;
        slide.classList.remove("is-entering");
        slide.setAttribute(
          "aria-label",
          `${slideIndex + 1} of ${slides.length}`
        );

        if (active && announce) {
          slide.classList.add("is-entering");
        }
      });

      selectors.forEach((selector) => {
        const active = Number(selector.dataset.reviewSelect) === current;

        if (active) {
          selector.setAttribute("aria-current", "true");
        } else {
          selector.removeAttribute("aria-current");
        }
      });

      if (currentLabel) {
        currentLabel.textContent = formatNumber(current + 1);
      }

      if (totalLabel) {
        totalLabel.textContent = formatNumber(slides.length);
      }

      if (status && announce) {
        status.textContent = `Showing testimonial ${current + 1} of ${slides.length}.`;
      }
    }

    previous.addEventListener("click", () => showSlide(current - 1));
    next.addEventListener("click", () => showSlide(current + 1));

    selectors.forEach((selector) => {
      selector.addEventListener("click", () => {
        const index = Number(selector.dataset.reviewSelect);

        if (Number.isInteger(index) && index >= 0 && index < slides.length) {
          showSlide(index);
        }
      });
    });

    slider.addEventListener("keydown", (event) => {
      if (
        event.target.closest(
          "input, textarea, select, [contenteditable='true']"
        )
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showSlide(current - 1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showSlide(current + 1);
      }
    });

    slider.addEventListener(
      "touchstart",
      (event) => {
        if (
          event.touches.length !== 1 ||
          event.target.closest("a, button")
        ) {
          touchStart = null;
          return;
        }

        touchStart = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY
        };
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchend",
      (event) => {
        if (!touchStart || !event.changedTouches.length) return;

        const deltaX = event.changedTouches[0].clientX - touchStart.x;
        const deltaY = event.changedTouches[0].clientY - touchStart.y;

        touchStart = null;

        if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
          showSlide(current + (deltaX < 0 ? 1 : -1));
        }
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchcancel",
      () => {
        touchStart = null;
      },
      { passive: true }
    );

    showSlide(0, false);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeReviewSliders);
} else {
  initializeReviewSliders();
}