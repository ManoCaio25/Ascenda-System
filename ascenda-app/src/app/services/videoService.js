export function createVideoProgress({ videoId, slug, currentTime, duration }) {
  const percentage = duration ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;
  return {
    id: `${slug}-${videoId}`,
    videoId,
    slug,
    currentTime,
    duration,
    percentage,
    updatedAt: new Date().toISOString()
  };
}