const AUTH_KEY = "ascenda_auth_accounts";
const CURRENT_USER_KEY = "ascenda_current_user_id";
const CURRENT_SESSION_KEY = "ascenda_current_session";
const API_TOKEN_KEY = "ascenda_api_token";
const MENTOR_INTERNS_KEY = "ascenda_interns";
const INTERN_USERS_KEY = "ascenda_estagiario_users";

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

const DEFAULT_ACCOUNTS = [
  {
    id: "1",
    role: "mentor",
    full_name: "Paulo Henrique Viera",
    email: "paulo.viera@ascenda.com",
    password: "123@Mudar.,",
    title: "Mentor Principal",
    avatar_url: "https://cdn.cloudflare.steamstatic.com/steam/apps/2536830/header.jpg",
  },
  {
    id: "mentor_helena",
    role: "mentor",
    full_name: "Helena Prado",
    email: "helena.prado@ascenda.com",
    password: "123456",
    title: "Frontend Mentor",
  },
  {
    id: "mentor_joao",
    role: "mentor",
    full_name: "Joao Freitas",
    email: "joao.freitas@ascenda.com",
    password: "123456",
    title: "PMO Mentor",
  },
  {
    id: "intern_caio",
    intern_id: "intern_profile_caio",
    role: "intern",
    full_name: "Caio Alvarenga",
    email: "caio.alvarenga@ascenda.com",
    password: "123@Mudar.,",
    mentor_id: "mentor_helena",
    mentor_name: "Helena Prado",
    substitute_mentor_id: "1",
    substitute_mentor_name: "Paulo Henrique Viera",
    track: "DEV WEB",
  },
  {
    id: "intern_iasmim",
    intern_id: "intern_profile_iasmim",
    role: "intern",
    full_name: "Iasmim",
    email: "iasmim@ascenda.com",
    password: "123@Mudar.,",
    mentor_id: "1",
    mentor_name: "Paulo Henrique Viera",
    substitute_mentor_id: "",
    substitute_mentor_name: "",
    track: "SAP HR",
  },
];

function readJson(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn(`Unable to read ${key}`, error);
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function createId(prefix, source) {
  const slug = source
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 36);
  return `${prefix}_${slug || Date.now()}`;
}

export function getAccounts() {
  const stored = readJson(AUTH_KEY, null);
  if (Array.isArray(stored) && stored.length > 0) {
    const emails = new Set(stored.map((account) => normalizeEmail(account.email || "")));
    const missingDefaults = DEFAULT_ACCOUNTS.filter(
      (account) => !emails.has(normalizeEmail(account.email)),
    );
    if (missingDefaults.length > 0) {
      const merged = [...stored, ...missingDefaults];
      writeJson(AUTH_KEY, merged);
      return merged;
    }
    return stored;
  }
  writeJson(AUTH_KEY, DEFAULT_ACCOUNTS);
  return DEFAULT_ACCOUNTS;
}

export function getMentors() {
  return getAccounts()
    .filter((account) => account.role === "mentor")
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}

function ensureUniqueEmail(email) {
  const exists = getAccounts().some((account) => normalizeEmail(account.email) === normalizeEmail(email));
  if (exists) {
    throw new Error("Este e-mail ja esta cadastrado.");
  }
}

function upsertMentorIntern(internAccount) {
  const interns = readJson(MENTOR_INTERNS_KEY, []);
  const mentor = getAccounts().find((account) => account.id === internAccount.mentor_id);
  const substitute = getAccounts().find((account) => account.id === internAccount.substitute_mentor_id);
  const record = {
    id: internAccount.intern_id,
    user_id: internAccount.id,
    full_name: internAccount.full_name,
    email: internAccount.email,
    avatar_url: internAccount.avatar_url || "",
    level: "Novice",
    status: "active",
    track: internAccount.track || "General Track",
    cohort: internAccount.cohort || "New Intake",
    points: 0,
    avg_score_pct: 0,
    well_being_status: "Neutral",
    start_date: new Date().toISOString(),
    skills: [],
    performance_history: [],
    mentor_id: mentor?.id || internAccount.mentor_id || null,
    mentor_name: mentor?.full_name || internAccount.mentor_name || null,
    mentor_email: mentor?.email || null,
    substitute_mentor_id: substitute?.id || internAccount.substitute_mentor_id || null,
    substitute_mentor_name: substitute?.full_name || internAccount.substitute_mentor_name || null,
    substitute_mentor_email: substitute?.email || null,
  };

  const next = interns.filter((item) => String(item.user_id || item.id) !== String(internAccount.id));
  next.push(record);
  writeJson(MENTOR_INTERNS_KEY, next);
  return record;
}

function syncInternPortalUser(internAccount) {
  const record = upsertMentorIntern(internAccount);
  writeJson(INTERN_USERS_KEY, [
    {
      id: record.id,
      user_id: record.user_id,
      full_name: record.full_name,
      email: record.email,
      avatar_url: record.avatar_url,
      area_atuacao: record.track,
      pontos_gamificacao: record.points,
      equipped_tag: "New Intern",
      mentor_name: record.mentor_name,
      mentor_email: record.mentor_email,
      substitute_mentor_name: record.substitute_mentor_name,
      substitute_mentor_email: record.substitute_mentor_email,
    },
  ]);
}

function upsertAccount(account) {
  const accounts = getAccounts();
  const next = accounts.filter((item) => String(item.id) !== String(account.id));
  next.push(account);
  writeJson(AUTH_KEY, next);
  return account;
}

export function persistAuthenticatedAccount(account, apiSession = null) {
  const normalized = {
    ...account,
    email: normalizeEmail(account.email),
    full_name: account.full_name || account.fullName || account.email,
    role: account.role || "intern",
  };

  upsertAccount(normalized);
  window.localStorage.setItem(CURRENT_USER_KEY, String(normalized.id));
  writeJson(CURRENT_SESSION_KEY, {
    user_id: normalized.id,
    role: normalized.role,
    email: normalized.email,
    full_name: normalized.full_name,
    provider: apiSession?.provider || "local",
  });

  if (apiSession?.access_token) {
    window.localStorage.setItem(API_TOKEN_KEY, apiSession.access_token);
  }

  if (normalized.role === "intern") {
    syncInternPortalUser(normalized);
  }

  return normalized;
}

export function persistRemoteAuthResult(result) {
  const payload = result?.data || result;
  const account = payload?.account || payload?.profile;

  if (!account) {
    throw new Error("Resposta de autenticacao invalida.");
  }

  const normalized = {
    ...account,
    id: account.id || payload.user?.id,
    email: account.email || payload.user?.email,
    full_name: account.full_name || account.fullName || payload.user?.email,
    role: account.role || payload.profile?.role || "intern",
    password: "",
  };

  if (payload.intern) {
    normalized.intern_id = payload.intern.id;
    normalized.mentor_id = payload.intern.mentor_id;
    normalized.mentor_name = payload.intern.mentor_name;
    normalized.substitute_mentor_id = payload.intern.substitute_mentor_id;
    normalized.substitute_mentor_name = payload.intern.substitute_mentor_name;
    normalized.track = payload.intern.track;
  }

  return persistAuthenticatedAccount(normalized, payload.session);
}

export function registerMentor(payload) {
  ensureUniqueEmail(payload.email);
  const account = {
    id: createId("mentor", payload.email),
    role: "mentor",
    full_name: payload.fullName.trim(),
    email: normalizeEmail(payload.email),
    password: payload.password,
    title: payload.title?.trim() || "Mentor",
    avatar_url: "",
  };
  writeJson(AUTH_KEY, [...getAccounts(), account]);
  return account;
}

export function registerIntern(payload) {
  ensureUniqueEmail(payload.email);
  const mentor = getAccounts().find((account) => account.id === payload.mentorId);
  const substitute = getAccounts().find((account) => account.id === payload.substituteMentorId);

  if (!mentor) {
    throw new Error("Selecione um mentor principal.");
  }

  const account = {
    id: createId("intern", payload.email),
    intern_id: createId("intern_profile", payload.email),
    role: "intern",
    full_name: payload.fullName.trim(),
    email: normalizeEmail(payload.email),
    password: payload.password,
    track: payload.track?.trim() || "General Track",
    mentor_id: mentor.id,
    mentor_name: mentor.full_name,
    substitute_mentor_id: substitute?.id || null,
    substitute_mentor_name: substitute?.full_name || null,
  };
  writeJson(AUTH_KEY, [...getAccounts(), account]);
  syncInternPortalUser(account);
  return account;
}

export function login({ email, password, role }) {
  const account = getAccounts().find(
    (item) =>
      item.role === role &&
      normalizeEmail(item.email) === normalizeEmail(email) &&
      item.password === password,
  );

  if (!account) {
    throw new Error("Credenciais incorretas.");
  }

  window.localStorage.setItem(CURRENT_USER_KEY, String(account.id));
  window.localStorage.removeItem(API_TOKEN_KEY);
  writeJson(CURRENT_SESSION_KEY, {
    user_id: account.id,
    role: account.role,
    email: account.email,
    full_name: account.full_name,
  });

  if (account.role === "intern") {
    syncInternPortalUser(account);
  }

  return account;
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
