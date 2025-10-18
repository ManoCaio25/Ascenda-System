import { useCallback, useEffect, useMemo, useState } from 'react';
import { Intern } from '@padrinho/entities/Intern';

const USER_TO_INTERN_MAP = {
  user_1: 'caio',
  user_2: 'gabriela',
  user_3: 'lucas',
  user_4: 'leticia',
  user_5: 'iasmin',
};

const normalizeAvatar = (intern) => intern?.avatar || intern?.avatar_url || '';

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
