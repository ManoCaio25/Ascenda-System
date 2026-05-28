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

function readEnvValue(key) {
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

const supabaseUrl = readEnvValue("SUPABASE_URL");
const supabaseAnonKey = readEnvValue("SUPABASE_ANON_KEY");
const supabaseServiceRoleKey = readEnvValue("SUPABASE_SERVICE_ROLE_KEY");
const requiredSupabaseValues = {
  SUPABASE_URL: supabaseUrl,
  SUPABASE_ANON_KEY: supabaseAnonKey,
  SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
};
const hasSupabaseConfig = Object.values(requiredSupabaseValues).every(Boolean);
const requestedProvider = String(process.env.DATA_PROVIDER || "").trim().toLowerCase();
const dataProvider = requestedProvider || (hasSupabaseConfig ? "supabase" : "mock");

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
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: parseCors(process.env.CORS_ORIGIN),
  dataProvider,
  hasSupabaseConfig,
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  openaiApiKey: readEnvValue("OPENAI_API_KEY"),
  openaiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || "2mb",
  authTokenTtlHours: Number(process.env.AUTH_TOKEN_TTL_HOURS || 12),
  exposeErrorDetails: parseBoolean(
    process.env.EXPOSE_ERROR_DETAILS,
    (process.env.NODE_ENV || "development") !== "production",
  ),
  allowPublicMentorSignup: parseBoolean(
    process.env.ALLOW_PUBLIC_MENTOR_SIGNUP,
    (process.env.NODE_ENV || "development") !== "production",
  ),
  allowPublicInternSignup: parseBoolean(
    process.env.ALLOW_PUBLIC_INTERN_SIGNUP,
    (process.env.NODE_ENV || "development") !== "production",
  ),
};
