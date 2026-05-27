import { createUserSupabase, supabaseAdmin } from "../lib/supabase.js";
import { forbidden, HttpError } from "../utils/httpError.js";

function extractBearerToken(req) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export async function requireAuth(req, _res, next) {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      throw new HttpError(401, "Missing bearer token");
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      throw new HttpError(401, "Invalid or expired token");
    }

    req.accessToken = token;
    req.user = data.user;
    req.db = createUserSupabase(token);

    const { data: profile } = await req.db
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    req.profile = profile || null;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles) {
  return function roleMiddleware(req, _res, next) {
    const role = req.profile?.role;

    if (!role || !roles.includes(role)) {
      next(forbidden("This action requires a different role"));
      return;
    }

    next();
  };
}

export const requireMentor = requireRole("admin", "mentor");
