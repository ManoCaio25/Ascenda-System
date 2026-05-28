import { apiRequest, withApiFallback } from "./apiClient";

export function getCurrentSession(fallback) {
  return withApiFallback(
    () => apiRequest("/auth/session"),
    fallback,
  );
}
