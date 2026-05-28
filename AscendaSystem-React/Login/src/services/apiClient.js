const API_URL = import.meta.env.VITE_API_URL || "";
const API_TOKEN_KEY = "ascenda_api_token";

export function isApiConfigured() {
  return Boolean(API_URL);
}

export function getApiToken() {
  return window.localStorage.getItem(API_TOKEN_KEY);
}

export async function apiRequest(path, options = {}) {
  if (!API_URL) {
    throw new Error("VITE_API_URL is not configured");
  }

  const token = options.token ?? getApiToken();
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || `API request failed: ${response.status}`);
  }

  return payload?.data ?? payload;
}
