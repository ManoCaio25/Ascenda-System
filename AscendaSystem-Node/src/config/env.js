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

const requiredSupabaseKeys = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
const hasSupabaseConfig = requiredSupabaseKeys.every((key) => Boolean(process.env[key]));
const requestedProvider = String(process.env.DATA_PROVIDER || "").trim().toLowerCase();
const dataProvider = requestedProvider || (hasSupabaseConfig ? "supabase" : "mock");

if (!["mock", "supabase"].includes(dataProvider)) {
  throw new Error("DATA_PROVIDER must be either 'mock' or 'supabase'");
}

if (dataProvider === "supabase") {
  for (const key of requiredSupabaseKeys) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable for Supabase mode: ${key}`);
    }
  }
}

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: parseCors(process.env.CORS_ORIGIN),
  dataProvider,
  hasSupabaseConfig,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
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
