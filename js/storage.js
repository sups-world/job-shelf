// js/storage.js

const STORAGE_KEY = "job-tracker-data";

/**
 * Get all jobs from localStorage
 * @returns {Array} Array of job objects
 */
export function getJobs() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load jobs:", error);
    return [];
  }
}

/**
 * Save entire jobs array to localStorage
 * @param {Array} jobs
 */
export function saveJobs(jobs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch (error) {
    console.error("Failed to save jobs:", error);
    alert("Failed to save data. Storage might be full.");
  }
}

/**
 * Add a new job
 * @param {Object} jobData - Job fields (without id)
 * @returns {Object} The newly created job (with id)
 */
export function addJob(jobData) {
  const jobs = getJobs();
  const newJob = {
    id: crypto.randomUUID(),
    ...jobData,
    createdAt: new Date().toISOString(),
  };
  jobs.push(newJob);
  saveJobs(jobs);
  return newJob;
}

/**
 * Update an existing job
 * @param {string} id
 * @param {Object} updates
 * @returns {Object|null} Updated job or null if not found
 */
export function updateJob(id, updates) {
  const jobs = getJobs();
  const index = jobs.findIndex((job) => job.id === id);
  if (index === -1) return null;

  jobs[index] = {
    ...jobs[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveJobs(jobs);
  return jobs[index];
}

/**
 * Delete a single job
 * @param {string} id
 * @returns {boolean} true if deleted
 */
export function deleteJob(id) {
  const jobs = getJobs();
  const filtered = jobs.filter((job) => job.id !== id);
  if (filtered.length === jobs.length) return false;
  saveJobs(filtered);
  return true;
}

/**
 * Delete multiple jobs by their IDs
 * @param {string[]} ids
 * @returns {number} Number of jobs deleted
 */
export function deleteJobs(ids) {
  const jobs = getJobs();
  const filtered = jobs.filter((job) => !ids.includes(job.id));
  const deletedCount = jobs.length - filtered.length;
  saveJobs(filtered);
  return deletedCount;
}

/**
 * Export all jobs as a JSON string
 * @returns {string}
 */
export function exportJobs() {
  const jobs = getJobs();
  return JSON.stringify(jobs, null, 2);
}

/**
 * Import jobs from a JSON string
 * Replaces all existing data
 * @param {string} jsonString
 * @returns {{ success: boolean, count: number, error?: string }}
 */
export function importJobs(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);

    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: "Invalid format: expected an array of jobs." };
    }

    // Basic validation - each item should have at least id or required fields
    const validJobs = parsed.filter(
      (job) => job && typeof job === "object" && job.companyName && job.jobTitle
    );

    saveJobs(validJobs);
    return { success: true, count: validJobs.length };
  } catch (error) {
    return { success: false, count: 0, error: "Invalid JSON file." };
  }
}