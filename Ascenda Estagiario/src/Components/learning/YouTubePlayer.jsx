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

export default function YouTubePlayer({ videoId, startTime = 0, onProgress }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const progressTimer = useRef(null);

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
          },
          onStateChange: (event) => {
            const YTPlayerState = window.YT?.PlayerState;
            if (!YTPlayerState) return;

            if (event.data === YTPlayerState.PLAYING) {
              clearInterval(progressTimer.current);
              progressTimer.current = setInterval(() => {
                if (!playerRef.current || typeof onProgress !== 'function') return;
                const currentTime = Math.floor(playerRef.current.getCurrentTime());
                onProgress(currentTime);
              }, 2000);
            }

            if (event.data === YTPlayerState.PAUSED || event.data === YTPlayerState.ENDED) {
              clearInterval(progressTimer.current);
              if (typeof onProgress === 'function') {
                const currentTime = Math.floor(playerRef.current?.getCurrentTime() || 0);
                onProgress(currentTime);
              }
            }
          },
        },
      });
    };

    setupPlayer();

    return () => {
      isMounted = false;
      clearInterval(progressTimer.current);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, startTime, onProgress]);

  return <div ref={containerRef} className="w-full h-full" />;
}
