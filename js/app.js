// js/app.js

import * as storage from "./storage.js";
import * as ui from "./ui.js";

// ======================
// State
// ======================
let selectedIds = new Set();
let currentViewJobId = null; // used when viewing/editing/deleting a single job
let pendingDeleteIds = [];   // used for delete confirmation

// ======================
// Helpers
// ======================
function getFilteredAndSortedJobs() {
  let jobs = storage.getJobs();

  // Search by company name
  const searchTerm = document.getElementById("search-input").value.trim().toLowerCase();
  if (searchTerm) {
    jobs = jobs.filter((job) =>
      job.companyName.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by status
  const statusFilter = document.getElementById("status-filter").value;
  if (statusFilter !== "all") {
    jobs = jobs.filter((job) => job.status === statusFilter);
  }

  // Sort by date applied
  const sortOrder = document.getElementById("sort-select").value;
  jobs.sort((a, b) => {
    const dateA = new Date(a.dateApplied);
    const dateB = new Date(b.dateApplied);
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  return jobs;
}

function refreshUI() {
  const jobs = getFilteredAndSortedJobs();
  ui.renderJobList(jobs, selectedIds);
  ui.updateBulkActions(selectedIds.size);
}

// ======================
// Event: Theme Toggle
// ======================
document.getElementById("theme-toggle").addEventListener("click", () => {
  ui.toggleTheme();
});

// ======================
// Event: Add Job buttons
// ======================
function openAddModal() {
  ui.fillJobForm(null);
  ui.openModal("job-modal");
}

document.getElementById("add-job-btn").addEventListener("click", openAddModal);
document.getElementById("empty-add-btn").addEventListener("click", openAddModal);

// ======================
// Event: Job Form Submit (Add or Edit)
// ======================
document.getElementById("job-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = ui.getFormData();
  const jobId = document.getElementById("job-id").value;

  // Basic required validation (HTML required already helps, but just in case)
  if (!formData.companyName || !formData.jobTitle || !formData.status || !formData.dateApplied) {
    alert("Please fill in all required fields.");
    return;
  }

  if (jobId) {
    // Edit existing
    storage.updateJob(jobId, formData);
  } else {
    // Add new
    storage.addJob(formData);
  }

  ui.closeModal("job-modal");
  refreshUI();
});

// ======================
// Event: Click on Job Card (open View modal)
// ======================
document.getElementById("job-list").addEventListener("click", (e) => {
  // Ignore clicks on the checkbox itself
  if (e.target.classList.contains("job-checkbox")) return;

  const card = e.target.closest(".job-card");
  if (!card) return;

  const jobId = card.dataset.id;
  const jobs = storage.getJobs();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return;

  currentViewJobId = jobId;
  ui.renderViewModal(job);
  ui.openModal("view-modal");
});

// ======================
// Event: Checkbox selection
// ======================
document.getElementById("job-list").addEventListener("change", (e) => {
  if (!e.target.classList.contains("job-checkbox")) return;

  const id = e.target.dataset.id;
  if (e.target.checked) {
    selectedIds.add(id);
  } else {
    selectedIds.delete(id);
  }

  // Update selected class on card
  const card = e.target.closest(".job-card");
  if (card) {
    card.classList.toggle("selected", e.target.checked);
  }

  ui.updateBulkActions(selectedIds.size);
});

// ======================
// Event: Bulk Delete
// ======================
document.getElementById("bulk-delete-btn").addEventListener("click", () => {
  if (selectedIds.size === 0) return;

  pendingDeleteIds = Array.from(selectedIds);
  document.getElementById("delete-message").textContent =
    `Are you sure you want to delete ${pendingDeleteIds.length} job application${pendingDeleteIds.length > 1 ? "s" : ""}? This action cannot be undone.`;
  ui.openModal("delete-modal");
});

// ======================
// Event: Clear Selection
// ======================
document.getElementById("clear-selection-btn").addEventListener("click", () => {
  selectedIds.clear();
  refreshUI();
});

// ======================
// Event: View Modal → Edit
// ======================
document.getElementById("view-edit-btn").addEventListener("click", () => {
  if (!currentViewJobId) return;

  const jobs = storage.getJobs();
  const job = jobs.find((j) => j.id === currentViewJobId);
  if (!job) return;

  ui.closeModal("view-modal");
  ui.fillJobForm(job);
  ui.openModal("job-modal");
});

// ======================
// Event: View Modal → Delete
// ======================
document.getElementById("view-delete-btn").addEventListener("click", () => {
  if (!currentViewJobId) return;

  pendingDeleteIds = [currentViewJobId];
  document.getElementById("delete-message").textContent =
    "Are you sure you want to delete this job application? This action cannot be undone.";
  ui.closeModal("view-modal");
  ui.openModal("delete-modal");
});

// ======================
// Event: Confirm Delete
// ======================
document.getElementById("confirm-delete-btn").addEventListener("click", () => {
  if (pendingDeleteIds.length === 0) return;

  storage.deleteJobs(pendingDeleteIds);

  // Clean up selection
  pendingDeleteIds.forEach((id) => selectedIds.delete(id));
  pendingDeleteIds = [];
  currentViewJobId = null;

  ui.closeModal("delete-modal");
  refreshUI();
});

// ======================
// Event: Close modals (X button + Cancel + Overlay)
// ======================
document.querySelectorAll(".modal").forEach((modal) => {
  // Close button
  modal.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", () => ui.closeModal(modal.id));
  });

  // Cancel buttons
  modal.querySelectorAll(".modal-cancel").forEach((btn) => {
    btn.addEventListener("click", () => ui.closeModal(modal.id));
  });

  // Click on overlay
  modal.querySelector(".modal-overlay").addEventListener("click", () => {
    ui.closeModal(modal.id);
  });
});

// Close modals with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    ui.closeAllModals();
  }
});

// ======================
// Event: Search, Filter, Sort
// ======================
document.getElementById("search-input").addEventListener("input", refreshUI);
document.getElementById("status-filter").addEventListener("change", refreshUI);
document.getElementById("sort-select").addEventListener("change", refreshUI);

// ======================
// Event: Export
// ======================
document.getElementById("export-btn").addEventListener("click", () => {
  const json = storage.exportJobs();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `job-tracker-export-${new Date().toISOString().split("T")[0]}.json`;
  a.click();

  URL.revokeObjectURL(url);
});

// ======================
// Event: Import
// ======================
document.getElementById("import-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const result = storage.importJobs(event.target.result);

    if (result.success) {
      selectedIds.clear();
      refreshUI();
      alert(`Successfully imported ${result.count} job${result.count !== 1 ? "s" : ""}.`);
    } else {
      alert("Import failed: " + result.error);
    }
  };
  reader.readAsText(file);

  // Reset input so the same file can be imported again if needed
  e.target.value = "";
});

// ======================
// Initialize App
// ======================
ui.loadTheme();
refreshUI();