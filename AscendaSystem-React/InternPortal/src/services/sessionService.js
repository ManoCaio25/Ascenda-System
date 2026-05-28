import { apiRequest, withApiFallback } from "./apiClient";

export function getCurrentSession(fallback) {
  return withApiFallback(
    () => apiRequest("/auth/session"),
    fallback,
  );
}

export function getCurrentIntern(fallback) {
  return withApiFallback(async () => {
    const interns = await apiRequest("/interns");
    return Array.isArray(interns) ? interns[0] : null;
  }, fallback);
}
