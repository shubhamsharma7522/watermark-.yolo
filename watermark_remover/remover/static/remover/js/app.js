/**
 * WatermarkAI — Client-side interaction logic
 *
 * Handles:
 *  1. Drag-and-drop & file-input preview
 *  2. AJAX upload with CSRF token
 *  3. Processing overlay with animated progress steps
 *  4. Result rendering & image zoom modal
 */

document.addEventListener("DOMContentLoaded", () => {
    // ---- DOM references ----
    const dropZone          = document.getElementById("drop-zone");
    const dropZoneContent   = document.getElementById("drop-zone-content");
    const previewContainer  = document.getElementById("preview-container");
    const previewImage      = document.getElementById("preview-image");
    const previewFilename   = document.getElementById("preview-filename");
    const btnChangeImage    = document.getElementById("btn-change-image");
    const fileInput         = document.getElementById("id_image");
    const form              = document.getElementById("upload-form");
    const btnUpload         = document.getElementById("btn-upload");
    const btnText           = btnUpload.querySelector(".btn-upload-text");
    const btnLoading        = btnUpload.querySelector(".btn-upload-loading");

    const overlay           = document.getElementById("processing-overlay");
    const statusText        = document.getElementById("processing-status");
    const progressFill      = document.getElementById("progress-bar-fill");
    const progressPercent   = document.getElementById("progress-percent");

    const uploadSection     = document.getElementById("upload-section");
    const resultsSection    = document.getElementById("results-section");
    const resultsGrid       = document.getElementById("results-grid");

    const jsErrorAlert      = document.getElementById("js-error-alert");
    const jsErrorMessage    = document.getElementById("js-error-message");

    const btnProcessAnother = document.getElementById("btn-process-another");

    // ---- Drag & Drop ----
    ["dragenter", "dragover"].forEach((evt) => {
        dropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add("drag-over");
        });
    });

    ["dragleave", "drop"].forEach((evt) => {
        dropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove("drag-over");
        });
    });

    dropZone.addEventListener("drop", (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            setFile(files[0]);
        }
    });

    // ---- Click to browse ----
    dropZone.addEventListener("click", (e) => {
        if (e.target.closest("#btn-change-image")) return;
        fileInput.click();
    });

    dropZone.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInput.click();
        }
    });

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            setFile(fileInput.files[0]);
        }
    });

    // ---- Change image button ----
    btnChangeImage.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.value = "";
        resetPreview();
        fileInput.click();
    });

    // ---- File helpers ----
    function setFile(file) {
        // Validate type
        const allowed = ["image/jpeg", "image/png", "image/bmp", "image/webp"];
        if (!allowed.includes(file.type)) {
            showError("Unsupported file type. Please upload a JPG, PNG, BMP, or WEBP image.");
            return;
        }
        // Validate size
        if (file.size > 10 * 1024 * 1024) {
            showError("File too large. Maximum allowed size is 10 MB.");
            return;
        }

        // Assign file to the hidden input via DataTransfer
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;

        // Show preview
        const reader = new FileReader();
        reader.onload = (ev) => {
            previewImage.src = ev.target.result;
            previewFilename.textContent = file.name;
            dropZoneContent.classList.add("d-none");
            previewContainer.classList.remove("d-none");
            btnUpload.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    function resetPreview() {
        previewImage.src = "";
        previewFilename.textContent = "";
        previewContainer.classList.add("d-none");
        dropZoneContent.classList.remove("d-none");
        btnUpload.disabled = true;
    }

    // ---- Error display ----
    function showError(msg) {
        jsErrorMessage.textContent = msg;
        jsErrorAlert.classList.remove("d-none");
        jsErrorAlert.classList.add("show");
        setTimeout(() => {
            jsErrorAlert.classList.remove("show");
            jsErrorAlert.classList.add("d-none");
        }, 8000);
    }

    // ---- Form submission (AJAX) ----
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!fileInput.files.length) {
            showError("Please select an image first.");
            return;
        }

        // Show processing overlay
        showOverlay();

        const formData = new FormData(form);

        try {
            setStep("upload", "active");
            updateProgress(10, "Uploading image...");

            const response = await fetch(form.action, {
                method: "POST",
                body: formData,
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            setStep("upload", "done");
            setStep("detect", "active");
            updateProgress(40, "Detecting watermarks...");

            // Simulate a small delay so users see the progress
            await delay(400);

            setStep("detect", "done");
            setStep("remove", "active");
            updateProgress(70, "Removing watermarks...");
            await delay(300);

            const data = await response.json();

            if (!response.ok || data.error) {
                hideOverlay();
                showError(data.error || "Server returned an error.");
                return;
            }

            setStep("remove", "done");
            setStep("done", "active");
            updateProgress(90, "Finalizing result...");
            await delay(300);

            setStep("done", "done");
            updateProgress(100, "Complete!");
            await delay(400);

            hideOverlay();
            showResults(data);
        } catch (err) {
            hideOverlay();
            showError("Network error. Please check your connection and try again.");
            console.error("Upload error:", err);
        }
    });

    // ---- Processing overlay helpers ----
    function showOverlay() {
        // Reset all steps
        ["upload", "detect", "remove", "done"].forEach((s) => {
            const el = document.getElementById(`step-${s}`);
            el.classList.remove("active", "done");
        });
        updateProgress(0, "Starting...");
        overlay.classList.remove("d-none");
    }

    function hideOverlay() {
        overlay.classList.add("d-none");
    }

    function setStep(stepId, state) {
        const el = document.getElementById(`step-${stepId}`);
        el.classList.remove("active", "done");
        el.classList.add(state);
    }

    function updateProgress(percent, text) {
        progressFill.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;
        if (text) statusText.textContent = text;
    }

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // ---- Display results ----
    function showResults(data) {
        uploadSection.classList.add("d-none");
        resultsSection.classList.remove("d-none");

        document.getElementById("img-original").src  = data.original;
        document.getElementById("img-detection").src  = data.detection;
        document.getElementById("img-cleaned").src    = data.cleaned;

        const btnDl = document.getElementById("btn-download");
        btnDl.href = data.cleaned;

        // Update / insert the badge
        let badgeContainer = resultsSection.querySelector(".result-badge");
        if (!badgeContainer) {
            const wrapper = document.createElement("div");
            wrapper.className = "text-center mb-4";
            resultsSection.insertBefore(wrapper, resultsGrid);
            badgeContainer = document.createElement("div");
            wrapper.appendChild(badgeContainer);
        }

        if (data.watermarks_found > 0) {
            badgeContainer.className = "result-badge result-badge-success";
            badgeContainer.innerHTML =
                `<i class="bi bi-check-circle-fill me-2"></i>${data.watermarks_found} watermark${data.watermarks_found > 1 ? "s" : ""} detected and removed`;
        } else {
            badgeContainer.className = "result-badge result-badge-info";
            badgeContainer.innerHTML =
                `<i class="bi bi-info-circle-fill me-2"></i>No watermarks detected in this image`;
        }

        // Reset form for next upload
        fileInput.value = "";
        resetPreview();
    }

    // ---- Process Another ----
    if (btnProcessAnother) {
        btnProcessAnother.addEventListener("click", () => {
            resultsSection.classList.add("d-none");
            uploadSection.classList.remove("d-none");
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // ---- Image zoom modal ----
    document.addEventListener("click", (e) => {
        const img = e.target.closest(".result-image");
        if (!img) return;

        const modal = document.createElement("div");
        modal.className = "zoom-modal";
        const zoomedImg = document.createElement("img");
        zoomedImg.src = img.src;
        zoomedImg.alt = img.alt;
        modal.appendChild(zoomedImg);
        document.body.appendChild(modal);

        modal.addEventListener("click", () => {
            modal.remove();
        });
        document.addEventListener("keydown", function handler(ev) {
            if (ev.key === "Escape") {
                modal.remove();
                document.removeEventListener("keydown", handler);
            }
        });
    });
});
