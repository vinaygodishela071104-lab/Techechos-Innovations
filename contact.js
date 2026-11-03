const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const scriptURL =
  "https://script.google.com/macros/s/AKfycbz4f698J-oFUrwihZNbSpZLVtEyh8crHJOXdWQGdvSjH9AcnGG-FscEyAa8XjHrYAh3/exec";
if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const requiredFields = contactForm.querySelectorAll("[required]");

    let isValid = true;

    requiredFields.forEach((field) => {
      const value = field.value.trim();

      const isInvalid =
        !value ||
        (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));

      field.classList.toggle("is-invalid", isInvalid);

      if (isInvalid) {
        isValid = false;
      }
    });

    if (!isValid) {
      formStatus.textContent = "Please complete the required fields correctly.";

      formStatus.style.color = "#dc2626";
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');

    const originalText = submitButton ? submitButton.innerHTML : "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    formStatus.textContent = "Sending your message...";
    formStatus.style.color = "var(--primary)";

    const formData = new FormData(contactForm);
    const data = new URLSearchParams();
    data.append("fullName", formData.get("name") || "");
    data.append("email", formData.get("email") || "");
    data.append("phone", formData.get("phone") || "");
    data.append("company", formData.get("company") || "");
    data.append("service", formData.get("service") || "");
    data.append("projectDetails", formData.get("message") || "");

    try {
      await fetch(scriptURL, {
        method: "POST",
        mode: "no-cors",
        body: data,
      });

      formStatus.textContent =
        "Thank you! Your enquiry has been submitted successfully.";

      formStatus.style.color = "var(--primary)";

      contactForm.reset();

      requiredFields.forEach((field) => {
        field.classList.remove("is-invalid");
      });
    } catch (error) {
      console.error("Submission error:", error);

      formStatus.textContent = "Unable to send your enquiry. Please try again.";

      formStatus.style.color = "#dc2626";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      }
    }
  });
}

const faqItems = document.querySelectorAll(".contact-support__item");

faqItems.forEach((item) => {
  const question = item.querySelector(".contact-support__question");

  if (!question) return;

  question.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");

    faqItems.forEach((otherItem) => {
      otherItem.classList.remove("is-open");

      const otherQuestion = otherItem.querySelector(
        ".contact-support__question",
      );

      if (otherQuestion) {
        otherQuestion.setAttribute("aria-expanded", "false");
      }
    });

    if (!isOpen) {
      item.classList.add("is-open");
      question.setAttribute("aria-expanded", "true");
    }
  });
});
