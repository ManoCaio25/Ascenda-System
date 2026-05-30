import { persistRemoteAuthResult } from "../authStore";
import { apiRequest, isApiConfigured } from "./apiClient";

function assertApiConfigured() {
  if (!isApiConfigured()) {
    throw new Error("VITE_API_URL is not configured.");
  }
}

export async function getMentors() {
  assertApiConfigured();
  return apiRequest("/mentors/public");
}

export async function login(payload) {
  assertApiConfigured();
  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: payload,
  });
  return persistRemoteAuthResult(result);
}

export async function registerMentor(payload) {
  assertApiConfigured();
  const result = await apiRequest("/auth/register-mentor", {
    method: "POST",
    body: payload,
  });

  if (result.session) {
    return persistRemoteAuthResult(result);
  }

  return login({
    email: payload.email,
    password: payload.password,
    role: "mentor",
  });
}

export async function registerIntern(payload) {
  assertApiConfigured();
  const result = await apiRequest("/auth/register-intern", {
    method: "POST",
    body: payload,
  });

  if (result.session) {
    return persistRemoteAuthResult(result);
  }

  return login({
    email: payload.email,
    password: payload.password,
    role: "intern",
  });
}
