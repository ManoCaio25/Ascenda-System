import { apiRequest, withApiFallback } from "./apiClient";

function sortItems(items, sort) {
  if (!sort) return items;
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  return [...items].sort((a, b) => {
    const left = a?.[field];
    const right = b?.[field];
    if (left == null && right == null) return 0;
    if (left == null) return desc ? 1 : -1;
    if (right == null) return desc ? -1 : 1;
    if (typeof left === "string" && typeof right === "string") {
      return desc ? right.localeCompare(left) : left.localeCompare(right);
    }
    if (left > right) return desc ? -1 : 1;
    if (left < right) return desc ? 1 : -1;
    return 0;
  });
}

function matchesCriteria(item, criteria = {}) {
  return Object.entries(criteria).every(([key, expected]) => {
    if (expected == null) return true;
    const value = item?.[key];
    if (Array.isArray(expected)) return expected.includes(value);
    if (typeof expected === "function") return expected(value, item);
    return value === expected;
  });
}

export function listInterns({ sort, limit, fallback }) {
  return withApiFallback(async () => {
    const items = await apiRequest("/interns");
    const sorted = sortItems(items || [], sort);
    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  }, fallback);
}

export function filterInterns({ criteria, sort, limit, fallback }) {
  return withApiFallback(async () => {
    const items = await apiRequest("/interns");
    const filtered = (items || []).filter((item) => matchesCriteria(item, criteria));
    const sorted = sortItems(filtered, sort);
    return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  }, fallback);
}

export function listMentors(fallback = () => []) {
  return withApiFallback(
    () => apiRequest("/mentors"),
    fallback,
  );
}

export function updateIntern(id, updates, fallback) {
  return withApiFallback(async () => {
    if (Object.hasOwn(updates, "mentor_id") && updates.mentor_id) {
      return apiRequest(`/interns/${id}/mentor`, {
        method: "PATCH",
        body: { mentorId: updates.mentor_id },
      });
    }

    if (Object.hasOwn(updates, "substitute_mentor_id")) {
      return apiRequest(`/interns/${id}/substitute-mentor`, {
        method: "PATCH",
        body: { substituteMentorId: updates.substitute_mentor_id || "" },
      });
    }

    return apiRequest(`/entities/interns/${id}`, {
      method: "PATCH",
      body: updates,
    });
  }, fallback);
}
