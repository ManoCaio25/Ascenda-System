import crypto from "node:crypto";
import { env } from "../config/env.js";
import { badRequest, conflict, forbidden, notFound, unauthorized } from "../utils/httpError.js";

const AUTH_SALT = "ascenda-dev-auth";
const sessions = new Map();
const aiJobs = [];

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(`${AUTH_SALT}:${password}`).digest("hex");
}

function createId(prefix, source) {
  const slug = String(source || crypto.randomUUID())
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 36);
  return `${prefix}_${slug || crypto.randomUUID().slice(0, 8)}`;
}

function publicAccount(account) {
  const { password_hash: _passwordHash, ...safe } = account;
  return { ...safe };
}

function profileFromAccount(account) {
  return {
    id: account.id,
    email: account.email,
    full_name: account.full_name,
    role: account.role,
    avatar_url: account.avatar_url || "",
    metadata: {
      title: account.title || "",
      mock: true,
    },
    created_at: account.created_at,
    updated_at: account.updated_at,
  };
}

function createSession(account) {
  const token = `mock_${crypto.randomBytes(32).toString("hex")}`;
  const expiresAt = Date.now() + env.authTokenTtlHours * 60 * 60 * 1000;
  sessions.set(token, { userId: account.id, expiresAt });

  return {
    access_token: token,
    token_type: "Bearer",
    expires_at: Math.floor(expiresAt / 1000),
    provider: "mock",
  };
}

const accounts = [];

const internProfiles = [];

function findAccountByEmail(email) {
  const normalized = normalizeEmail(email);
  return accounts.find((account) => account.email === normalized);
}

function findAccountById(id) {
  return accounts.find((account) => String(account.id) === String(id));
}

function findMentorById(id) {
  const account = findAccountById(id);
  if (!account || !["mentor", "admin"].includes(account.role)) {
    return null;
  }
  return account;
}

function ensureUniqueEmail(email) {
  if (findAccountByEmail(email) || internProfiles.some((intern) => intern.email === normalizeEmail(email))) {
    throw conflict("This email is already registered");
  }
}

function enrichIntern(intern) {
  const mentor = intern.mentor_id ? findAccountById(intern.mentor_id) : null;
  const substitute = intern.substitute_mentor_id ? findAccountById(intern.substitute_mentor_id) : null;

  return {
    ...intern,
    mentor_name: mentor?.full_name || null,
    mentor_email: mentor?.email || null,
    substitute_mentor_name: substitute?.full_name || null,
    substitute_mentor_email: substitute?.email || null,
  };
}

function canViewIntern(profile, intern) {
  if (!profile) return false;
  if (profile.role === "admin") return true;
  if (profile.role === "mentor") {
    return intern.mentor_id === profile.id || intern.substitute_mentor_id === profile.id;
  }
  return intern.user_id === profile.id;
}

function canManageIntern(profile, intern) {
  if (!profile) return false;
  if (profile.role === "admin") return true;
  return profile.role === "mentor" && intern.mentor_id === profile.id;
}

export const mockDataAdapter = {
  provider: "mock",

  async login({ email, password, role }) {
    const account = findAccountByEmail(email);

    if (!account || account.password_hash !== hashPassword(password) || (role && account.role !== role)) {
      throw unauthorized("Invalid credentials");
    }

    return {
      user: {
        id: account.id,
        email: account.email,
      },
      profile: profileFromAccount(account),
      account: publicAccount(account),
      session: createSession(account),
    };
  },

  async getSessionFromToken(token) {
    const session = sessions.get(token);

    if (!session || session.expiresAt < Date.now()) {
      if (session) sessions.delete(token);
      throw unauthorized("Invalid or expired token");
    }

    const account = findAccountById(session.userId);
    if (!account) {
      sessions.delete(token);
      throw unauthorized("Invalid session");
    }

    return {
      user: {
        id: account.id,
        email: account.email,
      },
      profile: profileFromAccount(account),
      account: publicAccount(account),
      db: null,
    };
  },

  async listMentors({ publicOnly = false } = {}) {
    return accounts
      .filter((account) => ["mentor", "admin"].includes(account.role))
      .sort((a, b) => a.full_name.localeCompare(b.full_name))
      .map((account) => {
        const safe = publicAccount(account);
        if (publicOnly) {
          return {
            id: safe.id,
            full_name: safe.full_name,
            title: safe.title || "Mentor",
            avatar_url: safe.avatar_url || "",
          };
        }
        return safe;
      });
  },

  async createMentor(payload) {
    const email = normalizeEmail(payload.email);
    ensureUniqueEmail(email);

    const account = {
      id: createId("mentor", email),
      role: "mentor",
      full_name: payload.fullName,
      email,
      password_hash: hashPassword(payload.password),
      title: payload.title || "Mentor",
      avatar_url: "",
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    accounts.push(account);

    return {
      user: { id: account.id, email: account.email },
      profile: profileFromAccount(account),
      account: publicAccount(account),
      session: createSession(account),
    };
  },

  async createIntern(payload, context = {}) {
    const email = normalizeEmail(payload.email);
    ensureUniqueEmail(email);

    const requestedMentorId =
      payload.mentorId || (context.profile?.role === "mentor" ? context.profile.id : "");
    const mentor = findMentorById(requestedMentorId);

    if (!mentor) {
      throw badRequest("A valid mentorId is required");
    }

    if (
      context.profile?.role === "mentor" &&
      context.profile.id !== mentor.id
    ) {
      throw forbidden("Mentors can only create interns linked to themselves");
    }

    const substitute = payload.substituteMentorId ? findMentorById(payload.substituteMentorId) : null;
    if (payload.substituteMentorId && !substitute) {
      throw badRequest("substituteMentorId must reference a mentor");
    }

    const account = {
      id: createId("intern", email),
      role: "intern",
      full_name: payload.fullName,
      email,
      password_hash: hashPassword(payload.password),
      title: "",
      avatar_url: "",
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    const intern = {
      id: createId("intern_profile", email),
      user_id: account.id,
      mentor_id: mentor.id,
      substitute_mentor_id: substitute?.id || null,
      created_by: context.profile?.id || mentor.id,
      full_name: payload.fullName,
      email,
      avatar_url: "",
      points: 0,
      level: "Novice",
      status: "active",
      well_being_status: "Neutral",
      track: payload.track || "General Track",
      cohort: payload.cohort || "New Intake",
      avg_score_pct: 0,
      start_date: nowIso(),
      skills: [],
      performance_history: [],
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    accounts.push(account);
    internProfiles.push(intern);

    return {
      user: { id: account.id, email: account.email },
      profile: profileFromAccount(account),
      account: {
        ...publicAccount(account),
        intern_id: intern.id,
        mentor_id: mentor.id,
        mentor_name: mentor.full_name,
        substitute_mentor_id: substitute?.id || null,
        substitute_mentor_name: substitute?.full_name || null,
        track: intern.track,
      },
      intern: enrichIntern(intern),
      session: createSession(account),
    };
  },

  async listInterns(context = {}) {
    return internProfiles
      .filter((intern) => canViewIntern(context.profile, intern))
      .map(enrichIntern)
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  },

  async updateInternMentor(internId, mentorId, context = {}) {
    const intern = internProfiles.find((item) => String(item.id) === String(internId));
    if (!intern || !canViewIntern(context.profile, intern)) {
      throw notFound("Intern not found");
    }
    if (!canManageIntern(context.profile, intern)) {
      throw forbidden("Only the primary mentor or admin can change the primary mentor");
    }

    const mentor = findMentorById(mentorId);
    if (!mentor) {
      throw badRequest("mentorId must reference a mentor");
    }

    intern.mentor_id = mentor.id;
    intern.updated_at = nowIso();
    return enrichIntern(intern);
  },

  async updateInternSubstituteMentor(internId, substituteMentorId, context = {}) {
    const intern = internProfiles.find((item) => String(item.id) === String(internId));
    if (!intern || !canViewIntern(context.profile, intern)) {
      throw notFound("Intern not found");
    }
    if (!canManageIntern(context.profile, intern)) {
      throw forbidden("Only the primary mentor or admin can change the substitute mentor");
    }

    const substitute = substituteMentorId ? findMentorById(substituteMentorId) : null;
    if (substituteMentorId && !substitute) {
      throw badRequest("substituteMentorId must reference a mentor");
    }

    intern.substitute_mentor_id = substitute?.id || null;
    intern.updated_at = nowIso();
    return enrichIntern(intern);
  },

  async createAiGenerationJob({ requestedBy, requestPayload, responsePayload }) {
    const job = {
      id: createId("ai_job", `${requestedBy}_${Date.now()}`),
      requested_by: requestedBy,
      intern_id: requestPayload.internId || null,
      source_kind: requestPayload.sourceUrl ? "youtube" : "text",
      source_title: requestPayload.sourceTitle || requestPayload.sourceUrl || "Untitled source",
      prompt: requestPayload.sourceText || requestPayload.sourceUrl || requestPayload.sourceTitle,
      request_payload: requestPayload,
      response_payload: responsePayload,
      created_at: nowIso(),
    };
    aiJobs.push(job);
    return job;
  },
};
