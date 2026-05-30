import dotenv from "dotenv";

dotenv.config();

function parseBoolean(value, fallback = false) {
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function parseCors(value) {
  return (value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function readEnvValue(key, aliases = []) {
  const keys = [key, ...aliases];
  const foundKey = keys.find((candidate) => process.env[candidate] != null);
  const sourceKey = foundKey || key;
  const rawValue = process.env[sourceKey];

  if (rawValue == null) return undefined;

  let value = String(rawValue).trim();

  for (const candidate of keys) {
    const accidentalAssignmentPrefix = `${candidate}=`;

    if (value.startsWith(accidentalAssignmentPrefix)) {
      value = value.slice(accidentalAssignmentPrefix.length).trim();
      break;
    }
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  return value;
}

function readLegacyEnvValue(key) {
  const rawValue = process.env[key];

  if (rawValue == null) return undefined;

  let value = String(rawValue).trim();
  const accidentalAssignmentPrefix = `${key}=`;

  if (value.startsWith(accidentalAssignmentPrefix)) {
    value = value.slice(accidentalAssignmentPrefix.length).trim();
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  return value;
}

function assertHttpUrl(key, value) {
  let parsedUrl;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error(`${key} must be a valid URL. Example: https://seu-projeto.supabase.co`);
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error(`${key} must start with http:// or https://`);
  }

  if (parsedUrl.pathname.replace(/\/$/, "") === "/rest/v1") {
    throw new Error(`${key} must be the Supabase project URL, not the Data API URL. Remove /rest/v1.`);
  }
}

function assertSupabaseKeyKind(label, value, expectedPrefix, wrongPrefix) {
  if (value.startsWith(wrongPrefix)) {
    throw new Error(`${label} received the wrong Supabase key type. Expected ${expectedPrefix}..., got ${wrongPrefix}...`);
  }

  const isModernKey = value.startsWith("sb_");
  const isLegacyJwt = value.startsWith("eyJ");

  if (!isModernKey && !isLegacyJwt) {
    throw new Error(`${label} does not look like a Supabase key. Copy the full key from Settings > API Keys.`);
  }
}

const supabaseUrl = readEnvValue("SUPABASE_URL");
const supabaseAnonKey = readEnvValue("SUPABASE_PUBLISHABLE_KEY", ["SUPABASE_ANON_KEY"]);
const supabaseServiceRoleKey = readEnvValue("SUPABASE_SECRET_KEY", ["SUPABASE_SERVICE_ROLE_KEY"]);
const requiredSupabaseValues = {
  SUPABASE_URL: supabaseUrl,
  "SUPABASE_PUBLISHABLE_KEY or SUPABASE_ANON_KEY": supabaseAnonKey,
  "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY": supabaseServiceRoleKey,
};
const hasSupabaseConfig = Object.values(requiredSupabaseValues).every(Boolean);
const nodeEnv = process.env.NODE_ENV || "development";
const requestedProvider = String(process.env.DATA_PROVIDER || "").trim().toLowerCase();
const dataProvider = requestedProvider || (hasSupabaseConfig ? "supabase" : "mock");
const authCookieSameSite = String(
  process.env.AUTH_COOKIE_SAMESITE || (nodeEnv === "production" ? "none" : "lax"),
).toLowerCase();

if (!["strict", "lax", "none"].includes(authCookieSameSite)) {
  throw new Error("AUTH_COOKIE_SAMESITE must be one of: strict, lax, none");
}

if (!["mock", "supabase"].includes(dataProvider)) {
  throw new Error("DATA_PROVIDER must be either 'mock' or 'supabase'");
}

if (dataProvider === "supabase") {
  for (const [key, value] of Object.entries(requiredSupabaseValues)) {
    if (!value) {
      throw new Error(`Missing required environment variable for Supabase mode: ${key}`);
    }
  }

  assertHttpUrl("SUPABASE_URL", supabaseUrl);
  assertSupabaseKeyKind("SUPABASE_PUBLISHABLE_KEY", supabaseAnonKey, "sb_publishable", "sb_secret");
  assertSupabaseKeyKind("SUPABASE_SECRET_KEY", supabaseServiceRoleKey, "sb_secret", "sb_publishable");
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv,
  corsOrigin: parseCors(process.env.CORS_ORIGIN),
  dataProvider,
  hasSupabaseConfig,
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  openaiApiKey: readLegacyEnvValue("OPENAI_API_KEY"),
  openaiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || "2mb",
  authTokenTtlHours: Number(process.env.AUTH_TOKEN_TTL_HOURS || 12),
  authCookieName: process.env.AUTH_COOKIE_NAME || "ascenda_session",
  authCookieDomain: readLegacyEnvValue("AUTH_COOKIE_DOMAIN"),
  authCookieSecure: parseBoolean(process.env.AUTH_COOKIE_SECURE, nodeEnv === "production"),
  authCookieSameSite,
  exposeErrorDetails: parseBoolean(
    process.env.EXPOSE_ERROR_DETAILS,
    nodeEnv !== "production",
  ),
  allowPublicMentorSignup: parseBoolean(
    process.env.ALLOW_PUBLIC_MENTOR_SIGNUP,
    nodeEnv !== "production",
  ),
  allowPublicInternSignup: parseBoolean(
    process.env.ALLOW_PUBLIC_INTERN_SIGNUP,
    nodeEnv !== "production",
  ),
};
