(() => {
  "use strict";

  function initializeCareerApplication() {
    const form = document.querySelector("#career-application-form");

    if (!form || form.dataset.initialized === "true") {
      return;
    }

    const fullName = form.querySelector("#career-name");
    const email = form.querySelector("#career-email");
    const location = form.querySelector("#career-location");
    const position = form.querySelector("#career-position");
    const experience = form.querySelector("#career-experience");
    const about = form.querySelector("#career-about");
    const resume = form.querySelector("#career-resume");

    const resumeHelp = form.querySelector("#career-resume-help");
    const resumeError = form.querySelector("#career-resume-error");
    const characterCount = form.querySelector("#career-character-count");
    const submitButton = form.querySelector("#career-submit");

    const successCard = document.querySelector("#career-success");
    const successTitle = document.querySelector("#career-success-title");
    const restartButton = document.querySelector("#career-restart");

    const scriptUrl =
      "https://script.google.com/macros/s/AKfycbz6-LTt75eSGFeleuf0_GmltdSBcyQYVnUmhiTERAnhMFGIYIVG5XEg_7DnRh9Ol3P7ag/exec";
    const maximumFileSize = 5 * 1024 * 1024;

    if (
      !fullName ||
      !email ||
      !location ||
      !position ||
      !experience ||
      !about ||
      !resume ||
      !resumeHelp ||
      !resumeError ||
      !characterCount ||
      !submitButton ||
      !successCard ||
      !successTitle ||
      !restartButton
    ) {
      return;
    }

    form.dataset.initialized = "true";

    const roleAliases = {
      frontend: "frontend",
      backend: "backend",
      fullstack: "fullstack",
      wordpress: "wordpress",
      hr: "hr",
      "sap-sd": "sap-sd",
      sapsd: "sap-sd",
      "sap-fico": "sap-fico",
      sapfico: "sap-fico",
    };

    const requestedRole = new URLSearchParams(window.location.search).get(
      "role",
    );

    const initialRole =
      requestedRole &&
      Object.prototype.hasOwnProperty.call(roleAliases, requestedRole)
        ? roleAliases[requestedRole]
        : "";

    position.value = initialRole;

    let statusMessage = null;

    function updateCharacterCount() {
      characterCount.textContent = `${about.value.length} / ${about.maxLength}`;
    }

    function showStatus(message) {
      if (!statusMessage) {
        statusMessage = document.createElement("p");
        statusMessage.className = "career-submit-status";
        statusMessage.setAttribute("role", "alert");

        submitButton.insertAdjacentElement("afterend", statusMessage);
      }

      statusMessage.style.marginTop = "14px";
      statusMessage.style.color = "var(--danger)";
      statusMessage.style.fontSize = "var(--nav-font-size)";
      statusMessage.style.lineHeight = "1.6";
      statusMessage.textContent = message;
    }

    function clearStatus() {
      if (statusMessage) {
        statusMessage.textContent = "";
      }
    }

    function resetFileFeedback() {
      resume.setCustomValidity("");
      resume.removeAttribute("aria-invalid");
      resumeError.textContent = "";
      resumeHelp.textContent = "PDF, DOC, or DOCX · Maximum 5 MB";
    }

    function validateResume() {
      resetFileFeedback();

      const file = resume.files[0];

      if (!file) {
        return false;
      }

      resumeHelp.textContent = `${file.name} · ${(file.size / (1024 * 1024)).toFixed(2)} MB`;

      let message = "";

      if (!/\.(pdf|doc|docx)$/i.test(file.name)) {
        message = "Please select a PDF, DOC, or DOCX résumé.";
      } else if (file.size === 0) {
        message = "The selected file is empty. Please choose another file.";
      } else if (file.size > maximumFileSize) {
        message = "Please select a résumé no larger than 5 MB.";
      }

      if (message) {
        resume.setCustomValidity(message);
        resume.setAttribute("aria-invalid", "true");
        resumeError.textContent = message;
        return false;
      }

      return true;
    }

    function readFileAsBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const result = String(reader.result || "");
          const commaIndex = result.indexOf(",");

          if (commaIndex === -1) {
            reject(new Error("Unable to read the résumé file."));
            return;
          }

          resolve(result.substring(commaIndex + 1));
        };

        reader.onerror = () => {
          reject(new Error("Unable to read the résumé file."));
        };

        reader.readAsDataURL(file);
      });
    }

    function getFileMimeType(fileName) {
      const extension = fileName.split(".").pop().toLowerCase();

      const types = {
        pdf: "application/pdf",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };

      return types[extension] || "application/octet-stream";
    }

    function getFieldValue(name) {
      const field = form.elements.namedItem(name);

      return field ? String(field.value || "").trim() : "";
    }

    async function buildPayload() {
      const file = resume.files[0];

      if (!file) {
        throw new Error("Please upload your résumé.");
      }

      const base64 = await readFileAsBase64(file);

      return {
        fullName: getFieldValue("fullName"),
        email: getFieldValue("email"),
        phone: getFieldValue("phone"),
        location: getFieldValue("location"),
        position: getFieldValue("position"),
        experience: getFieldValue("experience"),
        linkedin: getFieldValue("linkedin"),
        portfolio: getFieldValue("portfolio"),
        about: getFieldValue("about"),
        informationConfirmed: form.elements.namedItem("informationConfirmed")
          .checked,
        resume: {
          fileName: file.name,
          mimeType: getFileMimeType(file.name),
          base64: base64,
        },
      };
    }

    function resetForm() {
      form.reset();

      position.value = initialRole;

      fullName.setCustomValidity("");
      location.setCustomValidity("");

      resetFileFeedback();
      updateCharacterCount();
      clearStatus();
    }

    function showConfirmation(result) {
      form.hidden = true;
      successCard.hidden = false;

      const successMessage = successCard.querySelector(
        ".career-success__message",
      );

      if (successMessage) {
        if (result.resumeSaved === false) {
          successMessage.textContent =
            "Your application details have been saved, but your résumé could not be uploaded. Please contact our team to share your résumé.";
        } else if (result.notificationSent === false) {
          successMessage.textContent =
            "Your application and résumé have been saved successfully. However, the email notification could not be sent. Our team can still access your application.";
        }
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      requestAnimationFrame(() => {
        successCard.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });

        successTitle.focus({
          preventScroll: true,
        });
      });

      if (!reduceMotion && typeof successCard.animate === "function") {
        successCard.getAnimations().forEach((animation) => {
          animation.cancel();
        });

        successCard.animate(
          [
            {
              opacity: 0,
              transform: "translateY(12px)",
            },
            {
              opacity: 1,
              transform: "translateY(0)",
            },
          ],
          {
            duration: 320,
            easing: "ease-out",
          },
        );
      }
    }

    fullName.addEventListener("input", () => {
      fullName.setCustomValidity("");
    });

    email.addEventListener("input", () => {
      email.setCustomValidity("");
    });

    location.addEventListener("input", () => {
      location.setCustomValidity("");
    });

    about.addEventListener("input", updateCharacterCount);
    resume.addEventListener("change", validateResume);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      clearStatus();

      fullName.setCustomValidity(
        fullName.value.trim() ? "" : "Please enter your full name.",
      );

      location.setCustomValidity(
        location.value.trim() ? "" : "Please enter your location.",
      );

      validateResume();

      if (!form.reportValidity()) {
        return;
      }

      if (
        !scriptUrl.startsWith("https://script.google.com/macros/s/") ||
        !scriptUrl.endsWith("/exec")
      ) {
        showStatus(
          "Please configure your deployed Job Application Apps Script URL.",
        );

        return;
      }

      const originalButtonContent = submitButton.innerHTML;

      submitButton.disabled = true;
      submitButton.textContent = "Submitting Application...";

      try {
        const payload = await buildPayload();

        const response = await fetch(scriptUrl, {
          method: "POST",
          redirect: "follow",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify(payload),
        });

        const responseText = await response.text();

        let result;

        try {
          result = JSON.parse(responseText);
        } catch (error) {
          throw new Error(
            "Unable to read the server response. Please check the Apps Script execution logs.",
          );
        }

        if (!response.ok || !result.success || !result.saved) {
          throw new Error(
            result.error || "Your application could not be saved.",
          );
        }

        resetForm();
        showConfirmation(result);
      } catch (error) {
        showStatus(error.message || "Something went wrong. Please try again.");
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonContent;
      }
    });

    restartButton.addEventListener("click", () => {
      resetForm();

      successCard.hidden = true;
      form.hidden = false;

      requestAnimationFrame(() => {
        fullName.focus();
      });
    });

    updateCharacterCount();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeCareerApplication, {
      once: true,
    });
  } else {
    initializeCareerApplication();
  }
})();
