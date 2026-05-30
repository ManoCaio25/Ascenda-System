const API_URL = import.meta.env.VITE_API_URL || "";

export function isApiReady() {
  return Boolean(API_URL);
}

export function isLocalDataFallbackEnabled() {
  return (
    import.meta.env.VITE_ALLOW_LOCAL_DATA_FALLBACK === "true" ||
    import.meta.env.VITE_ALLOW_LOCAL_AUTH_FALLBACK === "true"
  );
}

export async function apiRequest(path, options = {}) {
  if (!API_URL) {
    throw new Error("VITE_API_URL is not configured");
  }

  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    credentials: "include",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || `API request failed: ${response.status}`);
  }

  return payload?.data ?? payload;
}

export async function withApiFallback(apiCall, fallbackCall) {
  if (!isApiReady()) {
    if (isLocalDataFallbackEnabled()) {
      return fallbackCall();
    }
    throw new Error("VITE_API_URL is not configured and local data fallback is disabled.");
  }

  try {
    return await apiCall();
  } catch (error) {
    if (!isLocalDataFallbackEnabled()) {
      throw error;
    }
    console.warn("API unavailable, using local InternPortal data.", error);
    return fallbackCall();
  }
}
