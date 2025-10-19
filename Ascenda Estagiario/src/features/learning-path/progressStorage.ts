export type Progress = {
  currentTime: number;
  duration: number;
  updatedAt: string;
};

const key = (lessonId: string) => `lp:progress:${lessonId}`;

export function saveProgress(lessonId: string, progress: Progress) {
  try {
    localStorage.setItem(key(lessonId), JSON.stringify(progress));
  } catch {}
}

export function loadProgress(lessonId: string): Progress | null {
  try {
    const raw = localStorage.getItem(key(lessonId));
    return raw ? (JSON.parse(raw) as Progress) : null;
  } catch {
    return null;
  }
}

export function clearProgress(lessonId: string) {
  try {
    localStorage.removeItem(key(lessonId));
  } catch {}
}
