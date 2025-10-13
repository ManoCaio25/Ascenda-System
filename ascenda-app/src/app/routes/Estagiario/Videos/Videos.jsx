import { useMemo } from 'react';
import { useStore } from '@store';

export default function Videos() {
  const user = useStore((state) => state.auth.user);
  const getVideosForSlug = useStore((state) => state.getVideosForSlug);
  const getVideoProgress = useStore((state) => state.getVideoProgress);
  const updateVideoProgress = useStore((state) => state.updateVideoProgress);

  const videos = useMemo(() => (user ? getVideosForSlug(user.slug) : []), [getVideosForSlug, user]);

  if (!user) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {videos.map((video) => {
        const progress = getVideoProgress(user.slug, video.id);
        return (
          <div key={video.id} className="rounded-3xl border border-white/5 bg-slate-900/40 p-5 shadow-glow">
            <div className="relative overflow-hidden rounded-2xl border border-white/5">
              <video
                src={video.url}
                poster={video.thumbnail}
                className="h-48 w-full object-cover"
                controls
                onTimeUpdate={(event) =>
                  updateVideoProgress({
                    slug: user.slug,
                    videoId: video.id,
                    currentTime: event.target.currentTime,
                    duration: event.target.duration
                  })
                }
                onLoadedMetadata={(event) => {
                  if (progress?.currentTime) {
                    event.currentTarget.currentTime = progress.currentTime;
                  }
                }}
              />
              {progress && (
                <span className="absolute right-3 top-3 rounded-full bg-brand-500/80 px-3 py-1 text-xs font-semibold text-white">
                  {progress.percentage}%
                </span>
              )}
            </div>
            <h3 className="mt-4 text-sm font-semibold text-white">{video.title}</h3>
          </div>
        );
      })}
    </div>
  );
}
