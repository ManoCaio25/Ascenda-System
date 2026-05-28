import { dataAdapter } from "../data/index.js";
import { forbidden, HttpError } from "../utils/httpError.js";

export function extractBearerToken(req) {
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

    const session = await dataAdapter.getSessionFromToken(token);
    req.accessToken = token;
    req.user = session.user;
    req.profile = session.profile || null;
    req.account = session.account || null;
    req.db = session.db || null;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      next();
      return;
    }

    const session = await dataAdapter.getSessionFromToken(token);
    req.accessToken = token;
    req.user = session.user;
    req.profile = session.profile || null;
    req.account = session.account || null;
    req.db = session.db || null;
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
