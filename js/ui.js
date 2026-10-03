// js/ui.js

/**
 * Format a date string (YYYY-MM-DD) into a nicer display format
 */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T00:00:00"); // avoid timezone issues
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

/**
 * Render the list of job cards
 * @param {Array} jobs - already filtered & sorted jobs
 * @param {Set} selectedIds - currently selected job IDs
 */
export function renderJobList(jobs, selectedIds = new Set()) {
  const jobListEl = document.getElementById("job-list");
  const emptyStateEl = document.getElementById("empty-state");

  // Clear previous content
  jobListEl.innerHTML = "";

  if (jobs.length === 0) {
    emptyStateEl.classList.remove("hidden");
    return;
  }

  emptyStateEl.classList.add("hidden");

  jobs.forEach((job) => {
    const isSelected = selectedIds.has(job.id);

    const card = document.createElement("div");
    card.className = `job-card${isSelected ? " selected" : ""}`;
    card.dataset.id = job.id;

    card.innerHTML = `
      <input
        type="checkbox"
        class="job-checkbox"
        data-id="${job.id}"
        ${isSelected ? "checked" : ""}
        aria-label="Select job"
      />
      <div class="job-card-content">
        <div class="job-card-top">
          <span class="job-title">${escapeHtml(job.jobTitle)}</span>
          <span class="status-badge status-${job.status}">${capitalize(job.status)}</span>
        </div>
        <div class="job-company">${escapeHtml(job.companyName)}</div>
        <div class="job-card-meta">
          <span>${formatDate(job.dateApplied)}</span>
          ${job.location ? `<span>• ${escapeHtml(job.location)}</span>` : ""}
        </div>
      </div>
    `;

    jobListEl.appendChild(card);
  });
}

/**
 * Update the bulk actions bar
 * @param {number} count
 */
export function updateBulkActions(count) {
  const bulkEl = document.getElementById("bulk-actions");
  const countEl = document.getElementById("selected-count");

  if (count > 0) {
    bulkEl.classList.remove("hidden");
    countEl.textContent = `${count} selected`;
  } else {
    bulkEl.classList.add("hidden");
  }
}

/**
 * Open a modal by id
 */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }
}

/**
 * Close a modal by id
 */
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }
}

/**
 * Close all modals
 */
export function closeAllModals() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.add("hidden");
  });
  document.body.style.overflow = "";
}

/**
 * Fill the Add/Edit form with job data (or clear it for new job)
 * @param {Object|null} job - null means "Add new"
 */
export function fillJobForm(job = null) {
  const form = document.getElementById("job-form");
  const titleEl = document.getElementById("job-modal-title");
  const submitBtn = document.getElementById("job-form-submit");

  if (job) {
    titleEl.textContent = "Edit Job";
    submitBtn.textContent = "Update Job";
    document.getElementById("job-id").value = job.id;
    document.getElementById("company-name").value = job.companyName || "";
    document.getElementById("job-title").value = job.jobTitle || "";
    document.getElementById("status").value = job.status || "applied";
    document.getElementById("date-applied").value = job.dateApplied || "";
    document.getElementById("location").value = job.location || "";
    document.getElementById("salary").value = job.salary || "";
    document.getElementById("company-website").value = job.companyWebsite || "";
    document.getElementById("job-link").value = job.jobLink || "";
    document.getElementById("contact-person").value = job.contactPerson || "";
    document.getElementById("contact-email").value = job.contactEmail || "";
    document.getElementById("notes").value = job.notes || "";
  } else {
    titleEl.textContent = "Add Job";
    submitBtn.textContent = "Save Job";
    form.reset();
    document.getElementById("job-id").value = "";
    // Set today's date as default
    document.getElementById("date-applied").value = new Date()
      .toISOString()
      .split("T")[0];
  }
}

/**
 * Get form data as a clean object
 */
export function getFormData() {
  return {
    companyName: document.getElementById("company-name").value.trim(),
    jobTitle: document.getElementById("job-title").value.trim(),
    status: document.getElementById("status").value,
    dateApplied: document.getElementById("date-applied").value,
    location: document.getElementById("location").value.trim(),
    salary: document.getElementById("salary").value.trim(),
    companyWebsite: document.getElementById("company-website").value.trim(),
    jobLink: document.getElementById("job-link").value.trim(),
    contactPerson: document.getElementById("contact-person").value.trim(),
    contactEmail: document.getElementById("contact-email").value.trim(),
    notes: document.getElementById("notes").value.trim(),
  };
}

/**
 * Render the View Job modal content
 * @param {Object} job
 */
export function renderViewModal(job) {
  const body = document.getElementById("view-modal-body");

  const fields = [
    { label: "Company", value: job.companyName },
    { label: "Job Title", value: job.jobTitle },
    { label: "Status", value: capitalize(job.status), isBadge: true, status: job.status },
    { label: "Date Applied", value: formatDate(job.dateApplied) },
    { label: "Location", value: job.location },
    { label: "Salary", value: job.salary },
    { label: "Company Website", value: job.companyWebsite, isLink: true },
    { label: "Job Link", value: job.jobLink, isLink: true },
    { label: "Contact Person", value: job.contactPerson },
    { label: "Contact Email", value: job.contactEmail, isEmail: true },
    { label: "Notes", value: job.notes },
  ];

  body.innerHTML = fields
    .map((field) => {
      let displayValue = "";

      if (!field.value) {
        displayValue = `<span class="view-value empty">Not provided</span>`;
      } else if (field.isBadge) {
        displayValue = `<span class="status-badge status-${field.status}">${field.value}</span>`;
      } else if (field.isLink) {
        displayValue = `<a href="${escapeHtml(field.value)}" target="_blank" rel="noopener">${escapeHtml(field.value)}</a>`;
      } else if (field.isEmail) {
        displayValue = `<a href="mailto:${escapeHtml(field.value)}">${escapeHtml(field.value)}</a>`;
      } else {
        displayValue = escapeHtml(field.value);
      }

      return `
        <div class="view-field">
          <div class="view-label">${field.label}</div>
          <div class="view-value">${displayValue}</div>
        </div>
      `;
    })
    .join("");
}

/**
 * Simple HTML escaping to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Toggle theme between dark and light
 */
export function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("job-tracker-theme", next);
}

/**
 * Load saved theme preference
 */
export function loadTheme() {
  const saved = localStorage.getItem("job-tracker-theme");
  if (saved === "light" || saved === "dark") {
    document.documentElement.setAttribute("data-theme", saved);
  }
}