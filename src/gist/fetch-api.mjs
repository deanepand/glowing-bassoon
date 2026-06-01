// Fetch API Wrapper - Modern HTTP Client
// A lightweight wrapper around the Fetch API with retry logic

const DEFAULT_TIMEOUT = 8000;
const MAX_RETRIES = 3;

async function fetchWithTimeout(url, options = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      console.warn(`Attempt ${attempt}/${retries} failed:`, error.message);

      if (attempt === retries) {
        throw new Error(`All ${retries} attempts failed for ${url}`);
      }

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 100;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Convenience methods
const api = {
  get: (url, headers = {}) =>
    fetchWithRetry(url, { method: "GET", headers }),

  post: (url, body, headers = {}) =>
    fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),

  put: (url, body, headers = {}) =>
    fetchWithRetry(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),

  delete: (url, headers = {}) =>
    fetchWithRetry(url, { method: "DELETE", headers }),
};

export { api, fetchWithRetry, fetchWithTimeout };
export default api;
