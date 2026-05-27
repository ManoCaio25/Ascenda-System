import React, { useState, useMemo } from "react";

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238A2BE2' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";

function isEmoji(str) {
  if (!str || typeof str !== 'string') return false;
  // Check for emoji characters including compound emojis
  const emojiRegex = /^(\p{Emoji}|\p{Emoji_Presentation}|\p{Emoji_Modifier_Base}|\p{Emoji_Component})+$/u;
  return emojiRegex.test(str.trim()) && str.trim().length <= 10;
}

function resolveAvatar(src) {
  if (!src) return FALLBACK;
  
  // If it's an emoji, create an SVG with proper rendering
  if (isEmoji(src)) {
    const emoji = src.trim();
    return `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <text x="50" y="50" font-size="70" text-anchor="middle" dominant-baseline="middle" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${emoji}</text>
      </svg>`
    )}`;
  }
  
  // If it's already a full URL or data URI
  if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }
  
  // For relative paths
  if (typeof src === 'string') {
    const cleanSrc = src.startsWith('/') ? src.slice(1) : src;
    return cleanSrc;
  }
  
  return FALLBACK;
}

export default function Avatar({ 
  src, 
  alt = "User avatar", 
  size = 44, 
  className = "" 
}) {
  const [error, setError] = useState(false);
  
  const avatarUrl = useMemo(() => {
    return error ? FALLBACK : resolveAvatar(src);
  }, [error, src]);

  const handleError = React.useCallback(() => {
    setError(true);
  }, []);

  return (
    <img
      src={avatarUrl}
      onError={handleError}
      alt={alt}
      width={size}
      height={size}
      decoding="async"
      loading="lazy"
      className={`rounded-full object-cover aspect-square shrink-0 ${className}`}
      style={{ 
        width: size, 
        height: size, 
        minWidth: size, 
        minHeight: size,
        backgroundColor: 'var(--surface-2)'
      }}
    />
  );
}