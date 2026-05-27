import { useCallback, useEffect, useMemo, useState } from 'react';

const PROGRESS_KEY = (id) => `progress-${id}`;
const PROGRESS_TIME_KEY = (id) => `progress-time-${id}`;
const COMPLETED_KEY = (id) => `completed-${id}`;

const clampNumber = (value, min, max) => Math.min(Math.max(value, min), max);

const safeParseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const safeReadStorage = (key) => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    return null;
  }
};

const safeWriteStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    // Silently ignore storage write issues (e.g., private browsing)
  }
};

export const formatVideoTime = (totalSeconds) => {
  if (typeof totalSeconds !== 'number' || Number.isNaN(totalSeconds) || totalSeconds <= 0) {
    return '00:00';
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const readStoredVideoProgress = (videoId) => {
  if (!videoId) {
    return { percent: 0, currentTime: 0, completed: false };
  }

  const storedPercent = safeParseNumber(safeReadStorage(PROGRESS_KEY(videoId)));
  const storedTime = safeParseNumber(safeReadStorage(PROGRESS_TIME_KEY(videoId)));
  const isCompleted = safeReadStorage(COMPLETED_KEY(videoId)) === 'true';

  return {
    percent: typeof storedPercent === 'number' ? clampNumber(storedPercent, 0, 100) : 0,
    currentTime: typeof storedTime === 'number' ? Math.max(0, storedTime) : 0,
    completed: Boolean(isCompleted),
  };
};

const createInitialState = (videoId) => ({
  ...readStoredVideoProgress(videoId),
  duration: 0,
});

const isMeaningfulNumber = (value) => typeof value === 'number' && Number.isFinite(value);

export default function useVideoProgress(videoId) {
  const [state, setState] = useState(() => createInitialState(videoId));

  useEffect(() => {
    setState(createInitialState(videoId));
  }, [videoId]);

  const updateDuration = useCallback((rawDuration) => {
    if (!isMeaningfulNumber(rawDuration)) return state.duration;

    const normalizedDuration = Math.max(0, Math.round(rawDuration));
    setState((prev) => {
      if (normalizedDuration === prev.duration) return prev;
      return { ...prev, duration: normalizedDuration };
    });

    return normalizedDuration;
  }, [state.duration]);

  const updateProgress = useCallback((progressPayload = {}) => {
    if (!videoId) {
      return { ...state, justCompleted: false };
    }

    const { currentTime: rawCurrentTime = 0, duration: rawDuration, percent: rawPercent } = progressPayload;

    const resolvedDuration = isMeaningfulNumber(rawDuration) ? Math.max(0, Math.round(rawDuration)) : state.duration;
    if (isMeaningfulNumber(rawDuration)) {
      setState((prev) => ({ ...prev, duration: resolvedDuration }));
    }

    const safeDuration = resolvedDuration > 0 ? resolvedDuration : state.duration;
    const boundedCurrentTime = Math.max(0, isMeaningfulNumber(rawCurrentTime) ? rawCurrentTime : 0);
    const calculatedPercent = safeDuration
      ? (boundedCurrentTime / safeDuration) * 100
      : isMeaningfulNumber(rawPercent)
        ? rawPercent
        : 0;
    const normalizedPercent = clampNumber(
      isMeaningfulNumber(rawPercent) ? rawPercent : calculatedPercent,
      0,
      100,
    );
    const roundedPercent = Number(normalizedPercent.toFixed(2));
    const roundedTime = Math.round(boundedCurrentTime);

    const justCompleted = roundedPercent >= 90 && !state.completed;

    setState((prev) => ({
      ...prev,
      currentTime: roundedTime,
      percent: roundedPercent,
      completed: prev.completed || roundedPercent >= 90,
      duration: safeDuration,
    }));

    safeWriteStorage(PROGRESS_KEY(videoId), roundedPercent.toFixed(2));
    safeWriteStorage(PROGRESS_TIME_KEY(videoId), String(roundedTime));

    if (roundedPercent >= 90) {
      safeWriteStorage(COMPLETED_KEY(videoId), 'true');
    }

    const nextState = {
      videoId,
      currentTime: roundedTime,
      percent: roundedPercent,
      duration: safeDuration,
      completed: roundedPercent >= 90 || state.completed,
      remainingTime: Math.max(0, safeDuration - roundedTime),
      justCompleted,
    };

    return nextState;
  }, [state, videoId]);

  const remainingTime = useMemo(() => Math.max(0, (state.duration || 0) - (state.currentTime || 0)), [state.currentTime, state.duration]);

  const formatted = useMemo(() => ({
    current: formatVideoTime(state.currentTime),
    duration: formatVideoTime(state.duration),
    remaining: formatVideoTime(remainingTime),
  }), [state.currentTime, state.duration, remainingTime]);

  const resetProgress = useCallback(() => {
    if (!videoId) return;
    safeWriteStorage(PROGRESS_KEY(videoId), '0');
    safeWriteStorage(PROGRESS_TIME_KEY(videoId), '0');
    safeWriteStorage(COMPLETED_KEY(videoId), 'false');
    setState({ percent: 0, currentTime: 0, duration: 0, completed: false });
  }, [videoId]);

  return {
    percent: state.percent,
    currentTime: state.currentTime,
    duration: state.duration,
    remainingTime,
    completed: state.completed,
    resumeTime: state.currentTime,
    formatted,
    updateProgress,
    updateDuration,
    resetProgress,
  };
}

export const buildVideoProgressKeys = {
  progress: PROGRESS_KEY,
  time: PROGRESS_TIME_KEY,
  completed: COMPLETED_KEY,
};
