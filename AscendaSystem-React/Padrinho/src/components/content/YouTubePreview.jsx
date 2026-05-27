import React, { useEffect, useState } from "react";
import { extractYouTubeId, getYouTubeThumbnail } from "../utils/youtube";
import { AlertCircle, Youtube } from "lucide-react";

export default function YouTubePreview({ url, onVideoIdChange }) {
  const [videoId, setVideoId] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) {
      setVideoId(null);
      setError(false);
      return;
    }

    const id = extractYouTubeId(url);
    if (id) {
      setVideoId(id);
      setError(false);
      if (onVideoIdChange) {
        onVideoIdChange(id);
      }
    } else {
      setVideoId(null);
      setError(true);
      if (onVideoIdChange) {
        onVideoIdChange(null);
      }
    }
  }, [url, onVideoIdChange]);

  if (!url) return null;

  if (error) {
    return (
      <div className="mt-2 p-3 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-error" />
        <span className="text-sm text-error">Invalid YouTube URL. Please check the link.</span>
      </div>
    );
  }

  if (videoId) {
    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-success">
          <Youtube className="w-4 h-4" />
          <span className="text-sm font-medium">YouTube Video Detected</span>
        </div>
        <div className="relative rounded-lg overflow-hidden border border-border bg-black">
          <img 
            src={getYouTubeThumbnail(videoId)} 
            alt="Video thumbnail"
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-12 h-12 bg-error rounded-full flex items-center justify-center">
              <Youtube className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}