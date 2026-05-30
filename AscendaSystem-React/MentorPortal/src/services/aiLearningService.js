import { apiRequest } from "./apiClient";

export async function generateLearningPackage(payload) {
  return apiRequest("/ai/generate-learning-package", {
    method: "POST",
    body: payload,
  });
}
