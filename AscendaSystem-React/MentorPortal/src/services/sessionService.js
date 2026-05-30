import { apiRequest, withApiFallback } from "./apiClient";

export function getCurrentSession(fallback) {
  return withApiFallback(
    () => apiRequest("/auth/session"),
    fallback,
  );
}

export async function logoutSession() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } catch (error) {
    console.warn("Unable to close remote session", error);
  }
}
