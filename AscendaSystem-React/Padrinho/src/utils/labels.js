import { useMemo } from "react";

export const normalizeKey = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

export const levelKeyMap = {
  novice: "internsPage.levels.novice",
  apprentice: "internsPage.levels.apprentice",
  journeyman: "internsPage.levels.journeyman",
  expert: "internsPage.levels.expert",
  master: "internsPage.levels.master",
};

export const trackKeyMap = {
  "javascript + react": "interns.tracks.javascriptReact",
  "sap + pmo": "interns.tracks.sapPmo",
  "sap": "interns.tracks.sap",
  "sap hr": "interns.tracks.sapHr",
  "sap hr + pmo": "interns.tracks.sapHrPmo",
  "sap hr + google": "interns.tracks.sapHrGoogle",
  "power bi": "interns.tracks.powerBi",
  "ai + python": "interns.tracks.aiPython",
  "google": "interns.tracks.google",
  "google workspace": "interns.tracks.googleWorkspace",
  "desenvolvimento web": "interns.tracks.webDevelopment",
  "web development": "interns.tracks.webDevelopment",
};

export const trainingTypeKeyMap = {
  all: "content.filters.trainingTypes.all",
  sap: "courseForm.trainingTypes.sap",
  webDevelopment: "courseForm.trainingTypes.webDevelopment",
  google: "courseForm.trainingTypes.google",
  sapHrPmo: "courseForm.trainingTypes.sapHrPmo",
  sapHr: "courseForm.trainingTypes.sapHr",
};

export const trainingTypeOrder = [
  "sap",
  "sapHr",
  "sapHrPmo",
  "webDevelopment",
  "google",
];

export const useTrainingTypeOptions = (t) =>
  useMemo(
    () =>
      ["all", ...trainingTypeOrder].map((value) => ({
        value,
        label: t(
          trainingTypeKeyMap[value],
          value === "all" ? "All training types" : value
        ),
      })),
    [t]
  );

export const getLevelLabel = (level, t, fallback) => {
  const key = levelKeyMap[normalizeKey(level)];
  if (key) {
    return t(key, fallback ?? level ?? "");
  }
  return level ?? fallback ?? "";
};

export const getTrackLabel = (track, t, fallback) => {
  const key = trackKeyMap[normalizeKey(track)];
  if (key) {
    return t(key, fallback ?? track ?? "");
  }
  return track ?? fallback ?? "";
};

export const getTrainingTypeLabel = (trainingType, t) => {
  if (!trainingType) return "";
  const key = trainingTypeKeyMap[trainingType];
  return key ? t(key, trainingType) : trainingType;
};
