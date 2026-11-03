document.addEventListener("DOMContentLoaded", () => {
  applySavedPreferences();
  createLucideIcons();
  initializeNavbar();
  initializeBackToTop();
});

function createLucideIcons(root = document) {
  if (typeof lucide !== "undefined") {
    lucide.createIcons({ root });
  }
}

function setLucideIcon(element, iconName) {
  if (!element) return;

  element.replaceChildren();

  const icon = document.createElement("i");
  icon.setAttribute("data-lucide", iconName);
  element.appendChild(icon);

  createLucideIcons(element);
}

function getStorageItem(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : fallback;
  } catch {
    return fallback;
  }
}

function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function applySavedPreferences() {
  const savedTheme = getStorageItem("theme", "light");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }

  updateToggleIcons();
}

function initializeNavbar() {
  const darkToggle = document.getElementById("darkToggle");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const mobileQuote = document.querySelector(".mobile-quote");
  const dropdowns = document.querySelectorAll(".dropdown");

  setActiveNavLink();
  updateToggleIcons();

  if (darkToggle) {
    setupDarkMode(darkToggle);
  }

  if (menuToggle && navLinks) {
    setupMobileMenu(menuToggle, navLinks, mobileQuote, dropdowns);
  }

  setupMobileDropdowns(dropdowns);
}

function updateToggleIcons() {
  const darkToggle = document.getElementById("darkToggle");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (darkToggle) {
    const isDark = document.body.classList.contains("dark-mode");

    setLucideIcon(darkToggle, isDark ? "sun" : "moon");

    darkToggle.title = isDark ? "Light Mode" : "Dark Mode";
    darkToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode",
    );
  }

  if (menuToggle) {
    const isOpen = navLinks && navLinks.classList.contains("active");

    setLucideIcon(menuToggle, isOpen ? "x" : "menu");

    menuToggle.title = isOpen ? "Close Menu" : "Menu";
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  }
}

function setupDarkMode(darkToggle) {
  darkToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");

    setStorageItem("theme", isDark ? "dark" : "light");

    updateToggleIcons();
  });
}

function setupMobileMenu(menuToggle, navLinks, mobileQuote, dropdowns) {
  menuToggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const isOpen = navLinks.classList.toggle("active");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");

    menuToggle.title = isOpen ? "Close Menu" : "Menu";

    if (mobileQuote) {
      mobileQuote.classList.toggle("active", isOpen);
    }

    setLucideIcon(menuToggle, isOpen ? "x" : "menu");

    if (isOpen) {
      navLinks.scrollTop = 0;
    }
  });

  navLinks.addEventListener("click", (event) => {
    const clickedLink = event.target.closest("a");

    if (!clickedLink) return;

    const isDropdownTrigger =
      clickedLink.classList.contains("dropdown-trigger");

    /*
      Dropdown trigger buttons should not close the menu.
      Normal links, including the Services main link,
      should navigate and close the mobile menu.
    */
    if (window.innerWidth <= 1024 && isDropdownTrigger) {
      return;
    }

    if (window.innerWidth <= 1024) {
      closeMobileMenu(menuToggle, navLinks, mobileQuote, dropdowns);
    }
  });

  if (mobileQuote) {
    mobileQuote.addEventListener("click", (event) => {
      const clickedLink = event.target.closest("a");

      if (!clickedLink) return;

      if (window.innerWidth <= 1024) {
        closeMobileMenu(menuToggle, navLinks, mobileQuote, dropdowns);
      }
    });
  }

  document.addEventListener("click", (event) => {
    if (window.innerWidth > 1024) return;
    if (!navLinks.classList.contains("active")) return;

    const header = document.querySelector(".site-header");

    if (header && !header.contains(event.target)) {
      closeMobileMenu(menuToggle, navLinks, mobileQuote, dropdowns);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) {
      closeMobileMenu(menuToggle, navLinks, mobileQuote, dropdowns);
    }
  });
}

function closeMobileMenu(menuToggle, navLinks, mobileQuote, dropdowns) {
  if (navLinks) {
    navLinks.classList.remove("active");
  }

  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    menuToggle.title = "Menu";

    setLucideIcon(menuToggle, "menu");
  }

  if (mobileQuote) {
    mobileQuote.classList.remove("active");
  }

  closeAllDropdowns(dropdowns);
}

function closeAllDropdowns(dropdowns) {
  dropdowns.forEach((dropdown) => {
    dropdown.classList.remove("active");

    const trigger =
      dropdown.querySelector(":scope > .dropdown-row > .dropdown-trigger") ||
      dropdown.querySelector(":scope > .dropdown-trigger");

    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }
  });
}

function setupMobileDropdowns(dropdowns) {
  dropdowns.forEach((dropdown) => {
    const trigger =
      dropdown.querySelector(":scope > .dropdown-row > .dropdown-trigger") ||
      dropdown.querySelector(":scope > .dropdown-trigger");

    const dropdownMenu = dropdown.querySelector(".dropdown-menu");

    if (!trigger || !dropdownMenu) return;

    trigger.setAttribute("aria-expanded", "false");

    trigger.addEventListener("click", (event) => {
      if (window.innerWidth > 1024) return;

      event.preventDefault();
      event.stopPropagation();

      const willOpen = !dropdown.classList.contains("active");

      closeAllDropdowns(dropdowns);

      if (willOpen) {
        dropdown.classList.add("active");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* Keep the main Services link active on service subpages */
function setActiveNavLink() {
  const currentPage =
    window.location.pathname.split("/").pop().toLowerCase() || "index.html";

  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach((link) => {
    link.classList.remove("active");
    link.removeAttribute("aria-current");
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");

    if (!href || href === "#" || href.startsWith("javascript:")) {
      return;
    }

    try {
      const linkPage = new URL(href, window.location.href).pathname
        .split("/")
        .pop()
        .toLowerCase();

      if (linkPage !== currentPage) return;

      link.classList.add("active");
      link.setAttribute("aria-current", "page");

      const servicesMenu = link.closest(".services-dropdown");

      if (servicesMenu) {
        const servicesDropdown = servicesMenu.closest(".dropdown");
        const servicesTrigger = servicesDropdown?.querySelector(
          ":scope > .dropdown-row > .dropdown-trigger",
        );

        if (servicesTrigger) {
          servicesTrigger.classList.add("active");
        }
      }
    } catch {}
  });
}

function initializeBackToTop() {
  const topButton = document.querySelector(".top-btn");

  if (!topButton) return;

  topButton.addEventListener("click", (event) => {
    event.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const footerEmailForm = document.getElementById("footerEmailForm");
  const footerEmail = document.getElementById("footerEmail");
  const requestQuoteButton = document.getElementById("requestQuoteButton");
  const footerQuoteMessage = document.getElementById("footerQuoteMessage");

  if (
    !footerEmailForm ||
    !footerEmail ||
    !requestQuoteButton ||
    !footerQuoteMessage
  ) {
    return;
  }

  let messageTimeout;

  requestQuoteButton.addEventListener("click", () => {
    clearTimeout(messageTimeout);

    footerEmailForm.reset();
    footerEmail.blur();

    footerQuoteMessage.hidden = false;
    footerQuoteMessage.classList.add("is-visible");

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }

    messageTimeout = setTimeout(() => {
      footerQuoteMessage.classList.remove("is-visible");
      footerQuoteMessage.hidden = true;
    }, 4500);
  });
});
