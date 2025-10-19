import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

type YouTubePlayerInstance = {
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  getVideoData: () => { video_id: string } | undefined;
  loadVideoById: (options: { videoId: string; startSeconds?: number }) => void;
  cueVideoById: (options: { videoId: string; startSeconds?: number }) => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  playVideo: () => void;
  stopVideo: () => void;
};

type Props = {
  videoId: string;
  startAt?: number;
  onReady?: (duration: number) => void;
  onDuration?: (duration: number) => void;
  onTime?: (current: number) => void;
  onEnd?: () => void;
  onError?: (code?: number) => void;
};

export type VideoPlayerHandle = {
  reload: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getPlayer: () => YouTubePlayerInstance | null;
};

declare global {
  interface Window {
    YT?: {
      Player: new (container: HTMLElement, options: Record<string, unknown>) => YouTubePlayerInstance;
      PlayerState?: Record<string, number>;
    };
    onYouTubeIframeAPIReady?: () => void;
    __ytApiPromise?: Promise<void>;
  }
}

const PLAYER_STATES = {
  ENDED: 0,
};

function ensureYouTubeAPI(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (!window.__ytApiPromise) {
    window.__ytApiPromise = new Promise<void>((resolve) => {
      const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(script);
      }

      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve();
      };
    });
  }
  return window.__ytApiPromise;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, Props>(
  ({ videoId, startAt = 0, onReady, onDuration, onTime, onEnd, onError }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<YouTubePlayerInstance | null>(null);
    const rafRef = useRef<number | null>(null);
    const readyRef = useRef(false);
    const latestStartAtRef = useRef(startAt);

    const durationCallbackRef = useRef(onDuration);
    const readyCallbackRef = useRef(onReady);
    const timeCallbackRef = useRef(onTime);
    const endCallbackRef = useRef(onEnd);
    const errorCallbackRef = useRef(onError);

    useEffect(() => {
      durationCallbackRef.current = onDuration;
    }, [onDuration]);

    useEffect(() => {
      readyCallbackRef.current = onReady;
    }, [onReady]);

    useEffect(() => {
      timeCallbackRef.current = onTime;
    }, [onTime]);

    useEffect(() => {
      endCallbackRef.current = onEnd;
    }, [onEnd]);

    useEffect(() => {
      errorCallbackRef.current = onError;
    }, [onError]);

    useEffect(() => {
      latestStartAtRef.current = startAt;
      const player = playerRef.current;
      if (player && readyRef.current && typeof startAt === 'number' && startAt > 0) {
        const duration = player.getDuration?.();
        if (!duration || startAt < duration) {
          player.seekTo(startAt, true);
        }
      }
    }, [startAt]);

    useImperativeHandle(
      ref,
      () => ({
        reload: () => {
          const player = playerRef.current;
          if (!player) return;
          try {
            player.loadVideoById({ videoId, startSeconds: latestStartAtRef.current || 0 });
          } catch (error) {
            console.error('Failed to reload video', error);
          }
        },
        seekTo: (seconds: number, allowSeekAhead = true) => {
          const player = playerRef.current;
          if (!player) return;
          player.seekTo(seconds, allowSeekAhead);
        },
        getPlayer: () => playerRef.current,
      }),
      [videoId],
    );

    useEffect(() => {
      let isMounted = true;

      const tick = () => {
        const player = playerRef.current;
        if (!player) return;
        try {
          const current = player.getCurrentTime?.();
          if (typeof current === 'number') {
            timeCallbackRef.current?.(current);
          }
        } catch {}
        rafRef.current = requestAnimationFrame(tick);
      };

      ensureYouTubeAPI()
        .then(() => {
          if (!isMounted || !containerRef.current) return;

          playerRef.current = new window.YT!.Player(containerRef.current, {
            videoId,
            playerVars: {
              rel: 0,
              modestbranding: 1,
              controls: 1,
            },
            events: {
              onReady: (event: { target: YouTubePlayerInstance }) => {
                if (!isMounted) return;
                readyRef.current = true;
                const player = event.target;
                playerRef.current = player;
                const duration = player.getDuration?.() || 0;
                readyCallbackRef.current?.(duration);
                durationCallbackRef.current?.(duration);
                if (latestStartAtRef.current > 0 && (!duration || latestStartAtRef.current < duration)) {
                  try {
                    player.seekTo(latestStartAtRef.current, true);
                  } catch {}
                }
                tick();
              },
              onStateChange: (event: { data: number }) => {
                if (event.data === PLAYER_STATES.ENDED) {
                  endCallbackRef.current?.();
                }
              },
              onError: (event: { data?: number }) => {
                errorCallbackRef.current?.(event?.data);
              },
            },
          });
        })
        .catch((error) => {
          console.error('Failed to initialize YouTube API', error);
          errorCallbackRef.current?.();
        });

      return () => {
        isMounted = false;
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        try {
          playerRef.current?.destroy();
        } catch {}
        playerRef.current = null;
      };
      // We intentionally create the player only once.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      const player = playerRef.current;
      if (!player || !readyRef.current) return;

      const currentVideoId = player.getVideoData?.()?.video_id;
      if (videoId && currentVideoId !== videoId) {
        try {
          player.loadVideoById({ videoId, startSeconds: latestStartAtRef.current || 0 });
        } catch (error) {
          console.error('Failed to load new video', error);
          errorCallbackRef.current?.();
        }
      }
    }, [videoId]);

    return <div ref={containerRef} style={{ width: '100%', aspectRatio: '16 / 9' }} />;
  },
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
