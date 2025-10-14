import React, { useState } from "react";
import { User } from "lucide-react";
import { getUserInitials, getRandomAvatar } from "@estagiario/Components/utils/avatarPlaceholders";

export default function AvatarWithFallback({ 
  user, 
  size = "md", 
  className = "",
  showFallback = true 
}) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm", 
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-xl"
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const renderFallback = () => {
    if (!showFallback) return null;

    // Try to get user initials first
    if (user?.full_name) {
      const initials = getUserInitials(user.full_name);
      return (
        <div className={`${sizeClasses[size]} ${className} bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center font-bold text-white cosmic-glow`}>
          {initials}
        </div>
      );
    }

    // Fall back to random avatar placeholder
    const placeholder = getRandomAvatar(user?.id || 'default');
    return (
      <div className={`${sizeClasses[size]} ${className} bg-slate-800 rounded-full flex items-center justify-center cosmic-glow border border-purple-500/30`}>
        <span className="text-2xl">{placeholder.emoji}</span>
      </div>
    );
  };

  // If no avatar URL or image failed to load, show fallback
  if (!user?.avatar_url || imageError) {
    return renderFallback();
  }

  return (
    <img
      src={user.avatar_url}
      alt={user.full_name || "User avatar"}
      className={`${sizeClasses[size]} ${className} rounded-full object-cover cosmic-glow border-2 border-purple-400`}
      onError={handleImageError}
      loading="lazy"
    />
  );
}