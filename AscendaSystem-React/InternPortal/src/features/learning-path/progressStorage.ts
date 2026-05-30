export type Progress = {
  currentTime: number;
  duration: number;
  updatedAt: string;
};

const key = (lessonId: string) => `lp:progress:${lessonId}`;
const progressByLesson = new Map<string, Progress>();

export function saveProgress(lessonId: string, progress: Progress) {
  progressByLesson.set(key(lessonId), progress);
}

export function loadProgress(lessonId: string): Progress | null {
  return progressByLesson.get(key(lessonId)) ?? null;
}

export function clearProgress(lessonId: string) {
  progressByLesson.delete(key(lessonId));
}
