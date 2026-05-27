export function extractYouTubeId(url) {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    
    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1) || null;
    }
    
    if (urlObj.hostname.includes('youtube.com')) {
      const v = urlObj.searchParams.get('v');
      if (v) return v;
      
      const parts = urlObj.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed' || parts[0] === 'shorts') {
        return parts[1] ?? null;
      }
    }
  } catch {
    return null;
  }
  
  return null;
}

export function getYouTubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}