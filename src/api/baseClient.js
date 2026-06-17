/**
 * baseClient.js - Simple REST client wrapping native fetch
 */
const BASE_URL = 'http://localhost:5001';

export const baseClient = {
  async get(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`GET ${endpoint} failed: ${response.status}`);
    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`POST ${endpoint} failed: ${response.status}`);
    return response.json();
  },

  async delete(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`DELETE ${endpoint} failed: ${response.status}`);
    return response.json();
  }
};
