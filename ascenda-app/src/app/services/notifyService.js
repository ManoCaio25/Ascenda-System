import notifyAsset from '../assets/audio/notify.mp3';

let audio;
let unlocked = false;

function ensureAudio() {
  if (!audio) {
    audio = new Audio(notifyAsset);
  }
  return audio;
}

export function requestSoundUnlock() {
  if (unlocked) return;
  try {
    const element = ensureAudio();
    element.volume = 0;
    element.play().catch(() => {});
    element.pause();
    element.currentTime = 0;
    unlocked = true;
  } catch (error) {
    // ignore
  }
}

export function notifySound() {
  if (!unlocked) return;
  try {
    const element = ensureAudio();
    element.currentTime = 0;
    element.volume = 0.7;
    element.play().catch(() => {});
  } catch (error) {
    // ignore
  }
}

export function toast(message, type = 'info') {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent('ascenda:toast', {
    detail: {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      message,
      type
    }
  });
  window.dispatchEvent(event);
}