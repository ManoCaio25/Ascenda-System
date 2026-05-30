import { apiRequest } from "../services/apiClient";

function displayDuration(activity, index) {
  if (activity.suggestedDueDays) {
    return `${activity.suggestedDueDays} dias`;
  }
  return `${15 + index * 5} minutos`;
}

export async function generateAscendaIAActivities({ focus, goal, youtubeUrl, fileName }) {
  const sourceTitle = focus?.trim() || fileName?.replace(/\.[^/.]+$/, "") || youtubeUrl?.trim() || "";
  const result = await apiRequest("/ai/generate-activities", {
    method: "POST",
    body: {
      sourceTitle,
      sourceText: goal?.trim() || "",
      sourceUrl: youtubeUrl?.trim() || "",
      activityCount: 4,
      questionCount: 5,
    },
  });

  return {
    id: `activity_${Date.now()}`,
    focus: sourceTitle || result.title,
    goal: goal?.trim() || result.summary,
    generatedAt: new Date().toISOString(),
    source: {
      youtubeUrl: youtubeUrl?.trim() || null,
      fileName: fileName || null,
    },
    items: (result.activities || []).map((activity, index) => ({
      id: `${Date.now()}_${index}`,
      title: activity.title,
      type: activity.category,
      duration: displayDuration(activity, index),
      instructions: activity.description,
      objectives: activity.objectives || [],
      questions: activity.questions || [],
    })),
    status: "draft",
  };
}
