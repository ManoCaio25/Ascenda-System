import { useCallback, useEffect, useMemo, useState } from 'react';
import { Intern } from '@padrinho/entities/Intern';

const USER_TO_INTERN_MAP = {
  user_1: 'caio',
  user_2: 'gabriela',
  user_3: 'lucas',
  user_4: 'leticia',
  user_5: 'iasmin',
};

const isEmoji = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  const emojiRegex = /(\p{Emoji}|\p{Emoji_Presentation}|\p{Emoji_Modifier_Base}|\p{Emoji_Component})/u;
  return emojiRegex.test(trimmed);
};

const normalizeAvatar = (intern) => {
  if (!intern) return '';

  const { avatar_url: avatarUrl, avatar } = intern;

  if (isEmoji(avatarUrl)) {
    return avatarUrl.trim();
  }

  if (typeof avatarUrl === 'string' && avatarUrl.trim()) {
    return avatarUrl.trim();
  }

  if (typeof avatar === 'string' && avatar.trim()) {
    return avatar.trim();
  }

  return '';
};

export function useForumAuthors() {
  const [interns, setInterns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadInterns = async () => {
      try {
        const data = await Intern.list();
        if (active) {
          setInterns(Array.isArray(data) ? data : []);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadInterns();

    return () => {
      active = false;
    };
  }, []);

  const internMap = useMemo(() => {
    const entries = new Map();
    interns.forEach((intern) => {
      if (!intern?.id) return;
      entries.set(String(intern.id), intern);
      if (intern.email) {
        entries.set(intern.email, intern);
      }
    });
    return entries;
  }, [interns]);

  const getAuthorProfile = useCallback(
    (authorId) => {
      if (!authorId) return null;

      const candidateIds = [String(authorId)];
      const mappedId = USER_TO_INTERN_MAP[authorId];
      if (mappedId) {
        candidateIds.push(String(mappedId));
      }

      for (const candidate of candidateIds) {
        if (internMap.has(candidate)) {
          const intern = internMap.get(candidate);
          return {
            ...intern,
            displayName: intern.full_name,
            avatar: normalizeAvatar(intern),
          };
        }
      }

      return null;
    },
    [internMap],
  );

  const authorsByUserId = useMemo(() => {
    const result = {};
    Object.keys(USER_TO_INTERN_MAP).forEach((key) => {
      const author = getAuthorProfile(key);
      if (author) {
        result[key] = author;
      }
    });
    return result;
  }, [getAuthorProfile]);

  return {
    getAuthorProfile,
    authorsByUserId,
    isLoading,
  };
}
