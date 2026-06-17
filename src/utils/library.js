import { baseClient } from "@/api/baseClient";

const LIBRARY_KEY = 'bookwise_library';
const CURRENT_SUMMARY_KEY = 'bookwise_current_summary';

const readJson = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getUserId = () => {
  try {
    const savedUser = window.localStorage.getItem('bookwise_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      return parsed.id || null;
    }
  } catch {}
  return null;
};

// LocalStorage helpers (used as local fallback)
export const getLibrary = () => readJson(LIBRARY_KEY, []);

export const saveSummary = (summary) => {
  const library = getLibrary();
  const nextLibrary = [summary, ...library.filter((item) => item.id !== summary.id)];
  window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(nextLibrary));
  return nextLibrary;
};

export const getSummary = (id) => getLibrary().find((summary) => summary.id === id);

export const deleteSummary = (id) => {
  const library = getLibrary();
  const nextLibrary = library.filter((item) => item.id !== id);
  window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(nextLibrary));
  return nextLibrary;
};

export const setCurrentSummary = (summary) => {
  window.localStorage.setItem(CURRENT_SUMMARY_KEY, JSON.stringify(summary));
};

export const getCurrentSummary = () => readJson(CURRENT_SUMMARY_KEY, null);

// Asynchronous Backend DB + LocalStorage Fallback Methods

/**
 * Fetch all summaries from Backend database, with LocalStorage fallback
 */
export const listDbSummaries = async () => {
  const userId = getUserId();
  if (!userId) return [];
  try {
    return await baseClient.get(`/api/summaries?userId=${userId}`);
  } catch (error) {
    console.warn("Failed to load summaries from backend DB, falling back to LocalStorage:", error);
    return getLibrary();
  }
};

/**
 * Fetch a single summary from Backend database, with LocalStorage fallback
 */
export const getDbSummary = async (id) => {
  const userId = getUserId();
  if (!userId) return null;
  try {
    return await baseClient.get(`/api/summaries/${id}`);
  } catch (error) {
    console.warn("Failed to get summary from backend DB, falling back to LocalStorage:", error);
    return getSummary(id) || (getCurrentSummary()?.id === id ? getCurrentSummary() : null);
  }
};

/**
 * Save a summary to Backend database, with LocalStorage fallback
 */
export const saveDbSummary = async (summary) => {
  const userId = getUserId();
  if (!userId) return summary;
  
  let summaryToSave = { ...summary };
  // If the summary is a new temporary upload, generate a clean permanent ID
  if (summary.id.startsWith('temp_')) {
    const cleanTitle = summary.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uuid = crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now().toString().slice(-8);
    summaryToSave.id = `${cleanTitle}-${uuid}`;
  }
  
  try {
    const response = await baseClient.post('/api/summaries', { userId, summary: summaryToSave });
    if (response && response.success && response.summary) {
      return response.summary;
    }
  } catch (error) {
    console.warn("Failed to save summary to backend DB, falling back to LocalStorage:", error);
  }
  
  // LocalStorage fallback
  saveSummary(summaryToSave);
  return summaryToSave;
};

/**
 * Delete a summary from Backend database, with LocalStorage fallback
 */
export const deleteDbSummary = async (id) => {
  const userId = getUserId();
  if (!userId) return;
  try {
    await baseClient.delete(`/api/summaries/${id}?userId=${userId}`);
  } catch (error) {
    console.warn("Failed to delete summary from backend DB, falling back to LocalStorage:", error);
  }
  deleteSummary(id);
};
