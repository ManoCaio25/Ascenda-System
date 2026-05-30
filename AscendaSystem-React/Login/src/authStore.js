const DEFAULT_APP_PATHS = {
  loading: "/AscendaSystem-React/LoadingPage/index.html",
  mentor: "/AscendaSystem-React/MentorPortal/index.html",
  intern: "/AscendaSystem-React/InternPortal/index.html",
};

function envPath(key, fallback) {
  return import.meta.env[key] || fallback;
}

function appUrl(path, devPort) {
  if (typeof window === "undefined") return path;
  if (/^https?:\/\//i.test(path)) return path;
  const isLocalDev = ["localhost", "127.0.0.1"].includes(window.location.hostname) && window.location.port;
  if (!isLocalDev) return path;
  return `${window.location.protocol}//${window.location.hostname}:${devPort}${path}`;
}

export const ROUTES = {
  get loading() {
    return appUrl(envPath("VITE_LOADING_PATH", DEFAULT_APP_PATHS.loading), 5174);
  },
  get mentor() {
    return appUrl(envPath("VITE_MENTOR_PATH", DEFAULT_APP_PATHS.mentor), 5175);
  },
  get intern() {
    return appUrl(envPath("VITE_INTERN_PATH", DEFAULT_APP_PATHS.intern), 5176);
  },
};

function normalizeEmail(value = "") {
  return value.trim().toLowerCase();
}

export function persistRemoteAuthResult(result) {
  const payload = result?.data || result;
  const account = payload?.account || payload?.profile;

  if (!account) {
    throw new Error("Resposta de autenticacao invalida.");
  }

  return {
    ...account,
    id: account.id || payload.user?.id,
    email: normalizeEmail(account.email || payload.user?.email),
    full_name: account.full_name || account.fullName || payload.user?.email,
    role: account.role || payload.profile?.role || "intern",
    ...(payload.intern
      ? {
          intern_id: payload.intern.id,
          mentor_id: payload.intern.mentor_id,
          mentor_name: payload.intern.mentor_name,
          substitute_mentor_id: payload.intern.substitute_mentor_id,
          substitute_mentor_name: payload.intern.substitute_mentor_name,
          track: payload.intern.track,
        }
      : {}),
  };
}

export function redirectThroughLoading(account) {
  const target = account.role === "mentor" ? ROUTES.mentor : ROUTES.intern;
  window.sessionStorage.setItem("nextUrl", target);
  window.sessionStorage.setItem("mode", "enter");
  window.sessionStorage.setItem("role", account.role);
  window.sessionStorage.setItem(
    "transitionProfile",
    JSON.stringify({
      full_name: account.full_name,
      role: account.role,
      target,
    }),
  );
  window.location.href = ROUTES.loading;
}
