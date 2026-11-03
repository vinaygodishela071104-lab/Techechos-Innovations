const metricValues = document.querySelectorAll(".services-metrics__value");

const animateMetric = (element) => {
  const target = Number(element.dataset.count);
  const suffix = element.dataset.suffix || "";
  const duration = 1600;
  const startTime = performance.now();

  const updateValue = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(target * easedProgress);

    element.textContent = `${currentValue}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(updateValue);
    }
  };

  requestAnimationFrame(updateValue);
};

const metricsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateMetric(entry.target);
        metricsObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.4,
  },
);

metricValues.forEach((value) => {
  metricsObserver.observe(value);
});
