import { useEffect, useRef } from 'react';

const SCRIPT_ID = 'youtube-iframe-api';
let apiPromise;

const loadYouTubeApi = () => {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }

  if (apiPromise) {
    return apiPromise;
  }

  apiPromise = new Promise((resolve) => {
    const existingScript = document.getElementById(SCRIPT_ID);

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    } else if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === 'function') {
        previousCallback();
      }
      resolve(window.YT);
    };
  });

  return apiPromise;
};

export default function YouTubePlayer({
  videoId,
  startTime = 0,
  onProgress,
  onDuration,
  onPlaybackStateChange,
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const progressTimer = useRef(null);
  const durationRef = useRef(0);

  const emitProgress = () => {
    if (!playerRef.current || typeof onProgress !== 'function') return;

    const currentTime = Math.floor(playerRef.current.getCurrentTime() || 0);
    const duration = Math.floor(playerRef.current.getDuration() || 0);

    if (duration > 0) {
      durationRef.current = duration;
      if (typeof onDuration === 'function') {
        onDuration(durationRef.current);
      }
    }

    const percent = durationRef.current
      ? Math.min(100, Math.round((currentTime / durationRef.current) * 100))
      : 0;

    onProgress({ currentTime, duration: durationRef.current, percent });
  };

  const handleStateChange = (event) => {
    const YTPlayerState = window.YT?.PlayerState;
    if (!YTPlayerState) return;

    const stateMap = {
      [YTPlayerState.UNSTARTED]: 'unstarted',
      [YTPlayerState.ENDED]: 'ended',
      [YTPlayerState.PLAYING]: 'playing',
      [YTPlayerState.PAUSED]: 'paused',
      [YTPlayerState.BUFFERING]: 'buffering',
      [YTPlayerState.CUED]: 'cued',
    };

    const mappedState = stateMap[event.data] || 'unknown';

    if (typeof onPlaybackStateChange === 'function') {
      onPlaybackStateChange(mappedState);
    }

    if (mappedState === 'playing') {
      clearInterval(progressTimer.current);
      progressTimer.current = setInterval(() => {
        emitProgress();
      }, 2000);
    }

    if (mappedState === 'paused' || mappedState === 'ended') {
      clearInterval(progressTimer.current);
      emitProgress();
    }
  };

  useEffect(() => {
    let isMounted = true;

    const setupPlayer = async () => {
      const YT = await loadYouTubeApi();
      if (!isMounted || !YT || !containerRef.current) return;

      playerRef.current = new YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          start: Math.floor(startTime || 0),
        },
        events: {
          onReady: (event) => {
            if (startTime > 0) {
              event.target.seekTo(startTime, true);
            }

            const duration = Math.floor(event.target.getDuration() || 0);
            if (duration > 0) {
              durationRef.current = duration;
              if (typeof onDuration === 'function') {
                onDuration(durationRef.current);
              }
            }

            if (typeof onPlaybackStateChange === 'function') {
              onPlaybackStateChange('ready');
            }

            emitProgress();
          },
          onStateChange: handleStateChange,
        },
      });
    };

    setupPlayer();

    return () => {
      isMounted = false;
      clearInterval(progressTimer.current);
      emitProgress();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, startTime, onProgress, onDuration, onPlaybackStateChange]);

  return <div ref={containerRef} className="w-full h-full" />;
}
