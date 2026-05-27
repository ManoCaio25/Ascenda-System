export const avatarPlaceholders = [
  {
    id: 'astronaut',
    emoji: '👨‍🚀',
    name: 'Astronaut',
    description: 'Ready for cosmic adventures'
  },
  {
    id: 'scientist', 
    emoji: '👩‍🔬',
    name: 'Scientist',
    description: 'Curious and analytical'
  },
  {
    id: 'developer',
    emoji: '👨‍💻', 
    name: 'Developer',
    description: 'Code enthusiast'
  },
  {
    id: 'designer',
    emoji: '👩‍🎨',
    name: 'Designer', 
    description: 'Creative visionary'
  },
  {
    id: 'robot',
    emoji: '🤖',
    name: 'Robot',
    description: 'AI-powered assistant'
  },
  {
    id: 'alien',
    emoji: '👽', 
    name: 'Alien',
    description: 'From another dimension'
  },
  {
    id: 'wizard',
    emoji: '🧙‍♂️',
    name: 'Wizard',
    description: 'Master of knowledge'
  },
  {
    id: 'ninja',
    emoji: '🥷',
    name: 'Ninja',
    description: 'Stealthy and focused'
  }
];

export const getRandomAvatar = (userId) => {
  // Generate consistent avatar based on user ID hash
  const hash = userId ? userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0) : 0;
  
  const index = Math.abs(hash) % avatarPlaceholders.length;
  return avatarPlaceholders[index];
};

export const getUserInitials = (fullName) => {
  if (!fullName) return 'U';
  
  return fullName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};