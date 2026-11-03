(() => {
  "use strict";

  function initializeInternshipForm() {
    const form = document.querySelector("#internship-form");

    if (!form || form.dataset.initialized === "true") {
      return;
    }

    const fullName = form.querySelector("#intern-name");
    const startDate = form.querySelector("#intern-start-date");
    const about = form.querySelector("#intern-about");
    const resume = form.querySelector("#intern-resume");
    const resumeHelp = form.querySelector("#intern-resume-help");
    const resumeError = form.querySelector("#intern-resume-error");
    const characterCount = form.querySelector("#intern-character-count");
    const position = form.querySelector("#intern-position");
    const submitButton = form.querySelector("#intern-submit");

    const successCard = document.querySelector("#intern-success");
    const successTitle = document.querySelector("#intern-success-title");
    const restartButton = document.querySelector("#intern-restart");

    const scriptUrl =
      "https://script.google.com/macros/s/AKfycbx5ZgQDYSqcNx1z_C6CTJTZew5CA48nyZsdtPiO5H4TOR5xQkcXHoKVceOy-ve8nO5rbw/exec";
    const maximumFileSize = 5 * 1024 * 1024;

    if (
      !fullName ||
      !startDate ||
      !about ||
      !resume ||
      !resumeHelp ||
      !resumeError ||
      !characterCount ||
      !position ||
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

    function getLocalDate() {
      const today = new Date();

      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    function setMinimumStartDate() {
      startDate.min = getLocalDate();
    }

    function updateCharacterCount() {
      characterCount.textContent = `${about.value.length} / ${about.maxLength}`;
    }

    function showStatus(message) {
      if (!statusMessage) {
        statusMessage = document.createElement("p");
        statusMessage.className = "intern-submit-status";
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

    function resetResumeFeedback() {
      resume.setCustomValidity("");
      resume.removeAttribute("aria-invalid");

      resumeError.textContent = "";
      resumeHelp.textContent = "PDF, DOC, or DOCX · Maximum 5 MB";
    }

    function validateResume() {
      resetResumeFeedback();

      const file = resume.files[0];

      if (!file) {
        return false;
      }

      resumeHelp.textContent = `${file.name} · ${(file.size / (1024 * 1024)).toFixed(2)} MB`;

      let message = "";

      if (!/\.(pdf|doc|docx)$/i.test(file.name)) {
        message = "Please select a PDF, DOC, or DOCX résumé.";
      } else if (file.size === 0) {
        message = "The selected résumé is empty.";
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

    function validateStartDate() {
      startDate.setCustomValidity("");

      if (!startDate.value) {
        return false;
      }

      if (startDate.value < getLocalDate()) {
        startDate.setCustomValidity("Please select today or a future date.");

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
        education: getFieldValue("education"),
        course: getFieldValue("course"),
        college: getFieldValue("college"),
        position: getFieldValue("position"),
        academicYear: getFieldValue("academicYear"),
        startDate: getFieldValue("startDate"),
        duration: getFieldValue("duration"),
        availability: getFieldValue("availability"),
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

    function showConfirmation(result) {
      form.hidden = true;
      successCard.hidden = false;

      const successMessage = successCard.querySelector("p");

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

        if (window.lucide) {
          window.lucide.createIcons();
        }
      });

      if (!reduceMotion && typeof successCard.animate === "function") {
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

    function resetForm() {
      form.reset();

      position.value = initialRole;

      resetResumeFeedback();
      setMinimumStartDate();
      updateCharacterCount();
      clearStatus();
    }

    fullName.addEventListener("input", () => {
      fullName.setCustomValidity("");
    });

    startDate.addEventListener("change", validateStartDate);
    about.addEventListener("input", updateCharacterCount);
    resume.addEventListener("change", validateResume);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      clearStatus();

      validateStartDate();
      validateResume();

      if (!form.reportValidity()) {
        return;
      }

      if (
        !scriptUrl.startsWith("https://script.google.com/macros/s/") ||
        !scriptUrl.endsWith("/exec")
      ) {
        showStatus(
          "Please enter your deployed Google Apps Script URL in internship.js.",
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
            "The server response could not be read. Check the spreadsheet and Apps Script execution logs before submitting again.",
          );
        }

        if (!response.ok || !result.success || !result.saved) {
          throw new Error(
            result.error || "Your application could not be saved.",
          );
        }

        showConfirmation(result);
      } catch (error) {
        showStatus(
          error.message ||
            "Something went wrong. Please try again after checking your connection.",
        );
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonContent;

        if (window.lucide) {
          window.lucide.createIcons();
        }
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

    setMinimumStartDate();
    updateCharacterCount();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeInternshipForm, {
      once: true,
    });
  } else {
    initializeInternshipForm();
  }
})();
