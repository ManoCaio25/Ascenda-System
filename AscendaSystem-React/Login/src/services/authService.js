import {
  getMentors as getLocalMentors,
  login as localLogin,
  persistRemoteAuthResult,
  registerIntern as localRegisterIntern,
  registerMentor as localRegisterMentor,
} from "../authStore";
import { apiRequest, isApiConfigured } from "./apiClient";

const allowLocalFallback = import.meta.env.VITE_ALLOW_LOCAL_AUTH_FALLBACK !== "false";

async function withApiFallback(apiCall, localCall) {
  if (!isApiConfigured()) {
    return localCall();
  }

  try {
    return await apiCall();
  } catch (error) {
    if (!allowLocalFallback) {
      throw error;
    }
    console.warn("API indisponivel, usando fluxo local temporario.", error);
    return localCall();
  }
}

export async function getMentors() {
  return withApiFallback(
    () => apiRequest("/mentors/public"),
    () => getLocalMentors(),
  );
}

export async function login(payload) {
  return withApiFallback(
    async () => {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: payload,
        token: "",
      });
      return persistRemoteAuthResult(result);
    },
    () => localLogin(payload),
  );
}

export async function registerMentor(payload) {
  return withApiFallback(
    async () => {
      const result = await apiRequest("/auth/register-mentor", {
        method: "POST",
        body: payload,
        token: "",
      });
      if (result.session?.access_token) {
        return persistRemoteAuthResult(result);
      }
      const loginResult = await apiRequest("/auth/login", {
        method: "POST",
        token: "",
        body: {
          email: payload.email,
          password: payload.password,
          role: "mentor",
        },
      });
      return persistRemoteAuthResult(loginResult);
    },
    () => localRegisterMentor(payload),
  );
}

export async function registerIntern(payload) {
  return withApiFallback(
    async () => {
      const result = await apiRequest("/auth/register-intern", {
        method: "POST",
        body: payload,
        token: "",
      });
      if (result.session?.access_token) {
        return persistRemoteAuthResult(result);
      }
      const loginResult = await apiRequest("/auth/login", {
        method: "POST",
        token: "",
        body: {
          email: payload.email,
          password: payload.password,
          role: "intern",
        },
      });
      return persistRemoteAuthResult(loginResult);
    },
    () => localRegisterIntern(payload),
  );
}
