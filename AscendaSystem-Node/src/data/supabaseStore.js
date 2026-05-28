import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { createUserSupabase, requireSupabaseAdmin } from "../lib/supabase.js";
import { badRequest, forbidden, notFound, unauthorized } from "../utils/httpError.js";

function publicProfile(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    role: profile.role,
    avatar_url: profile.avatar_url,
    metadata: profile.metadata || {},
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}

function createSupabaseAuthClient() {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getProfileById(id) {
  const supabaseAdmin = requireSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw badRequest(error.message, error);
  }

  return data;
}

async function getMentorById(id) {
  if (!id) return null;
  const supabaseAdmin = requireSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .in("role", ["mentor", "admin"])
    .maybeSingle();

  if (error) {
    throw badRequest(error.message, error);
  }

  return data;
}

async function enrichInterns(interns = []) {
  const supabaseAdmin = requireSupabaseAdmin();
  const profileIds = [
    ...new Set(
      interns
        .flatMap((intern) => [intern.mentor_id, intern.substitute_mentor_id])
        .filter(Boolean),
    ),
  ];

  if (profileIds.length === 0) {
    return interns;
  }

  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("id,email,full_name,avatar_url,role")
    .in("id", profileIds);

  if (error) {
    throw badRequest(error.message, error);
  }

  const byId = new Map((profiles || []).map((profile) => [profile.id, profile]));
  return interns.map((intern) => {
    const mentor = byId.get(intern.mentor_id);
    const substitute = byId.get(intern.substitute_mentor_id);
    return {
      ...intern,
      mentor_name: mentor?.full_name || null,
      mentor_email: mentor?.email || null,
      substitute_mentor_name: substitute?.full_name || null,
      substitute_mentor_email: substitute?.email || null,
    };
  });
}

async function assertCanManageIntern(internId, context) {
  const { data: intern, error } = await context.db
    .from("intern_profiles")
    .select("*")
    .eq("id", internId)
    .maybeSingle();

  if (error) {
    throw badRequest(error.message, error);
  }

  if (!intern) {
    throw notFound("Intern not found");
  }

  if (context.profile?.role === "admin") {
    return intern;
  }

  if (context.profile?.role === "mentor" && intern.mentor_id === context.profile.id) {
    return intern;
  }

  throw forbidden("Only the primary mentor or admin can change this intern");
}

export const supabaseDataAdapter = {
  provider: "supabase",

  async login({ email, password }) {
    const client = createSupabaseAuthClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error || !data?.session || !data?.user) {
      throw unauthorized(error?.message || "Invalid credentials");
    }

    const userClient = createUserSupabase(data.session.access_token);
    const { data: profile, error: profileError } = await userClient
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      throw badRequest(profileError.message, profileError);
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      profile: publicProfile(profile),
      account: publicProfile(profile),
      session: {
        access_token: data.session.access_token,
        token_type: data.session.token_type || "Bearer",
        expires_at: data.session.expires_at,
        provider: "supabase",
      },
    };
  },

  async getSessionFromToken(token) {
    const supabaseAdmin = requireSupabaseAdmin();
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      throw unauthorized("Invalid or expired token");
    }

    const db = createUserSupabase(token);
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      throw badRequest(profileError.message, profileError);
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      profile: publicProfile(profile),
      account: publicProfile(profile),
      db,
    };
  },

  async listMentors({ publicOnly = false } = {}) {
    const supabaseAdmin = requireSupabaseAdmin();
    const select = publicOnly
      ? "id,full_name,avatar_url,metadata"
      : "id,email,full_name,avatar_url,role,metadata,created_at,updated_at";
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select(select)
      .in("role", ["mentor", "admin"])
      .order("full_name", { ascending: true });

    if (error) {
      throw badRequest(error.message, error);
    }

    return data || [];
  },

  async createMentor(payload) {
    const supabaseAdmin = requireSupabaseAdmin();
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        full_name: payload.fullName,
      },
    });

    if (authError || !authData?.user) {
      throw badRequest(authError?.message || "Unable to create mentor", authError);
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: authData.user.id,
        email: payload.email,
        full_name: payload.fullName,
        role: "mentor",
        metadata: {
          title: payload.title || "Mentor",
        },
      })
      .select("*")
      .single();

    if (error) {
      throw badRequest(error.message, error);
    }

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      profile: publicProfile(profile),
      account: publicProfile(profile),
      session: null,
    };
  },

  async createIntern(payload, context = {}) {
    const supabaseAdmin = requireSupabaseAdmin();
    const mentorId = payload.mentorId || (context.profile?.role === "mentor" ? context.profile.id : "");
    const mentor = await getMentorById(mentorId);

    if (!mentor) {
      throw badRequest("A valid mentorId is required");
    }

    if (context.profile?.role === "mentor" && mentor.id !== context.profile.id) {
      throw forbidden("Mentors can only create interns linked to themselves");
    }

    const substitute = payload.substituteMentorId
      ? await getMentorById(payload.substituteMentorId)
      : null;

    if (payload.substituteMentorId && !substitute) {
      throw badRequest("substituteMentorId must reference a mentor");
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true,
      user_metadata: {
        full_name: payload.fullName,
      },
    });

    if (authError || !authData?.user) {
      throw badRequest(authError?.message || "Unable to create intern", authError);
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: authData.user.id,
        email: payload.email,
        full_name: payload.fullName,
        role: "intern",
      })
      .select("*")
      .single();

    if (profileError) {
      throw badRequest(profileError.message, profileError);
    }

    const { data: intern, error: internError } = await supabaseAdmin
      .from("intern_profiles")
      .insert({
        user_id: authData.user.id,
        mentor_id: mentor.id,
        substitute_mentor_id: substitute?.id || null,
        created_by: context.profile?.id || mentor.id,
        full_name: payload.fullName,
        email: payload.email,
        track: payload.track || "General Track",
        cohort: payload.cohort || "New Intake",
        start_date: new Date().toISOString().slice(0, 10),
      })
      .select("*")
      .single();

    if (internError) {
      throw badRequest(internError.message, internError);
    }

    const [enriched] = await enrichInterns([intern]);

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      profile: publicProfile(profile),
      account: {
        ...publicProfile(profile),
        intern_id: intern.id,
        mentor_id: mentor.id,
        mentor_name: mentor.full_name,
        substitute_mentor_id: substitute?.id || null,
        substitute_mentor_name: substitute?.full_name || null,
        track: intern.track,
      },
      intern: enriched,
      session: null,
    };
  },

  async listInterns(context = {}) {
    const db = context.db || requireSupabaseAdmin();
    const { data, error } = await db
      .from("intern_profiles")
      .select("*")
      .order("full_name", { ascending: true });

    if (error) {
      throw badRequest(error.message, error);
    }

    return enrichInterns(data || []);
  },

  async updateInternMentor(internId, mentorId, context = {}) {
    await assertCanManageIntern(internId, context);
    const mentor = await getMentorById(mentorId);

    if (!mentor) {
      throw badRequest("mentorId must reference a mentor");
    }

    const supabaseAdmin = requireSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("intern_profiles")
      .update({ mentor_id: mentor.id })
      .eq("id", internId)
      .select("*")
      .single();

    if (error) {
      throw badRequest(error.message, error);
    }

    const [enriched] = await enrichInterns([data]);
    return enriched;
  },

  async updateInternSubstituteMentor(internId, substituteMentorId, context = {}) {
    await assertCanManageIntern(internId, context);
    const substitute = substituteMentorId ? await getMentorById(substituteMentorId) : null;

    if (substituteMentorId && !substitute) {
      throw badRequest("substituteMentorId must reference a mentor");
    }

    const supabaseAdmin = requireSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("intern_profiles")
      .update({ substitute_mentor_id: substitute?.id || null })
      .eq("id", internId)
      .select("*")
      .single();

    if (error) {
      throw badRequest(error.message, error);
    }

    const [enriched] = await enrichInterns([data]);
    return enriched;
  },

  async createAiGenerationJob({ requestedBy, requestPayload, responsePayload }) {
    const supabaseAdmin = requireSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("ai_generation_jobs")
      .insert({
        requested_by: requestedBy,
        intern_id: requestPayload.internId,
        source_kind: requestPayload.sourceUrl ? "youtube" : "text",
        source_title: requestPayload.sourceTitle || requestPayload.sourceUrl || "Untitled source",
        prompt: requestPayload.sourceText || requestPayload.sourceUrl,
        request_payload: requestPayload,
        response_payload: responsePayload,
      })
      .select("*")
      .single();

    if (error) {
      throw badRequest(error.message, error);
    }

    return data;
  },
};
