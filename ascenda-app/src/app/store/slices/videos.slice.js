import { createVideoProgress } from '../../services/videoService.js';

export const createVideosSlice = (set, get) => ({
  getVideosForSlug(slug) {
    return get().videos.filter((video) => video.slug === slug);
  },
  getVideoProgress(slug, videoId) {
    return get().videoProgress.find((item) => item.slug === slug && item.videoId === videoId);
  },
  updateVideoProgress({ slug, videoId, currentTime, duration }) {
    const progress = createVideoProgress({ slug, videoId, currentTime, duration });
    set((state) => {
      const existing = state.videoProgress.filter((item) => !(item.slug === slug && item.videoId === videoId));
      return { videoProgress: [...existing, progress] };
    });
    get().persist();
    return progress;
  }
});