import { apiRequest, isApiReady, isLocalDataFallbackEnabled } from '../services/apiClient';

const isBrowser = typeof window !== 'undefined';

const clone = (value) => JSON.parse(JSON.stringify(value));

const REMOTE_ENTITY_BY_STORAGE_KEY = {
  ascenda_interns: 'interns',
  ascenda_courses: 'courses',
  ascenda_course_assignments: 'courseAssignments',
  ascenda_tasks: 'tasks',
  ascenda_feedback_entries: 'feedbackEntries',
  ascenda_notifications: 'notifications',
  ascenda_vacation_requests: 'vacationRequests',
  ascenda_chat_messages: 'chatMessages',
  ascenda_estagiario_forum_categories: 'forumCategories',
  ascenda_estagiario_forum_topics: 'forumTopics',
  ascenda_estagiario_forum_replies: 'forumReplies',
};

const SORT_FIELD_ALIASES = {
  created_date: 'created_at',
  updated_date: 'updated_at',
};

const dispatchEvent = (key, eventName, detail) => {
  if (!isBrowser) return;
  try {
    window.dispatchEvent(new CustomEvent(`${key}:${eventName}`, { detail }));
  } catch (error) {
    console.warn(`Failed to dispatch ${eventName} event for ${key}:`, error);
  }
};

const sortBy = (items, sort) => {
  if (!sort) return items;
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  return items.sort((a, b) => {
    const aValue = a?.[field];
    const bValue = b?.[field];

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return desc ? 1 : -1;
    if (bValue == null) return desc ? -1 : 1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return desc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    }

    if (aValue > bValue) return desc ? -1 : 1;
    if (aValue < bValue) return desc ? 1 : -1;
    return 0;
  });
};

const matchesCriteria = (item, criteria = {}) => {
  return Object.entries(criteria).every(([key, expected]) => {
    if (expected == null) return true;
    const value = item?.[key];

    if (Array.isArray(expected)) {
      if (Array.isArray(value)) {
        return expected.some((option) => value.includes(option));
      }
      return expected.includes(value);
    }

    if (typeof expected === 'function') {
      try {
        return expected(value, item);
      } catch (error) {
        console.warn('Filter function threw an error', error);
        return false;
      }
    }

    return value === expected;
  });
};

const cleanUpdates = (updates = {}) => {
  const result = {};
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      result[key] = value;
    }
  });
  return result;
};

const normalizeSortField = (field) => SORT_FIELD_ALIASES[field] || field;

const appendQuery = (path, params) => {
  const query = params.toString();
  return query ? `${path}?${query}` : path;
};

const canSendCriterion = (value) => (
  value == null ||
  ['string', 'number', 'boolean'].includes(typeof value)
);

const buildListPath = (entity, { criteria, sort, limit } = {}) => {
  const params = new URLSearchParams();
  let requiresClientFilter = false;

  if (sort) {
    const desc = sort.startsWith('-');
    const field = desc ? sort.slice(1) : sort;
    params.set('order', normalizeSortField(field));
    if (desc) {
      params.set('desc', 'true');
    }
  }

  if (typeof limit === 'number') {
    params.set('limit', String(limit));
  }

  Object.entries(criteria || {}).forEach(([key, value]) => {
    if (!canSendCriterion(value)) {
      requiresClientFilter = true;
      return;
    }
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });

  return {
    path: appendQuery(`/entities/${entity}`, params),
    requiresClientFilter,
  };
};

export function createEntityStore(storageKey, initialData = []) {
  const remoteEntity = REMOTE_ENTITY_BY_STORAGE_KEY[storageKey];
  let data = clone(initialData);

  const persist = () => {};

  const nextId = () => {
    const numericIds = data.map((item) => Number(item.id) || 0);
    return (numericIds.length ? Math.max(...numericIds) : 0) + 1;
  };

  const list = async (sort, limit) => {
    return withRemote(
      async () => {
        const { path } = buildListPath(remoteEntity, { sort, limit });
        return apiRequest(path);
      },
      () => {
        const items = sortBy([...data], sort);
        const sliced = typeof limit === 'number' ? items.slice(0, limit) : items;
        return clone(sliced);
      },
    );
  };

  const filter = async (criteria = {}, sort, limit) => {
    return withRemote(
      async () => {
        const { path, requiresClientFilter } = buildListPath(remoteEntity, { criteria, sort, limit });
        let items = await apiRequest(path);
        if (requiresClientFilter) {
          items = items.filter((item) => matchesCriteria(item, criteria));
          items = sortBy(items, sort);
          if (typeof limit === 'number') {
            items = items.slice(0, limit);
          }
        }
        return items;
      },
      () => {
        let items = data.filter((item) => matchesCriteria(item, criteria));
        items = sortBy(items, sort);
        if (typeof limit === 'number') {
          items = items.slice(0, limit);
        }
        return clone(items);
      },
    );
  };

  const findById = async (id) => {
    return withRemote(
      () => apiRequest(`/entities/${remoteEntity}/${id}`),
      () => {
        const match = data.find((item) => String(item.id) === String(id));
        return match ? clone(match) : null;
      },
    );
  };

  const create = async (record) => {
    const item = {
      ...record,
      id: record?.id ?? nextId(),
    };
    if (!item.created_date) {
      item.created_date = new Date().toISOString();
    }
    return withRemote(
      async () => {
        const created = await apiRequest(`/entities/${remoteEntity}`, {
          method: 'POST',
          body: item,
        });
        const payload = { record: clone(created) };
        dispatchEvent(storageKey, 'create', payload);
        dispatchEvent(storageKey, 'change', { ...payload, type: 'create' });
        return created;
      },
      () => {
        data = [...data, item];
        persist();
        const payload = { record: clone(item) };
        dispatchEvent(storageKey, 'create', payload);
        dispatchEvent(storageKey, 'change', { ...payload, type: 'create' });
        return clone(item);
      },
    );
  };

  const update = async (id, updates) => {
    const cleaned = cleanUpdates(updates);
    return withRemote(
      async () => {
        const updated = await apiRequest(`/entities/${remoteEntity}/${id}`, {
          method: 'PATCH',
          body: cleaned,
        });
        const payload = { id, record: clone(updated) };
        dispatchEvent(storageKey, 'update', payload);
        dispatchEvent(storageKey, 'change', { ...payload, type: 'update' });
        return updated;
      },
      () => {
        let updated = null;
        data = data.map((item) => {
          if (String(item.id) !== String(id)) return item;
          const next = { ...item, ...cleaned };
          if (cleaned.updated_at === undefined) {
            next.updated_at = new Date().toISOString();
          }
          updated = next;
          return next;
        });
        persist();
        if (updated) {
          const payload = { id, record: clone(updated) };
          dispatchEvent(storageKey, 'update', payload);
          dispatchEvent(storageKey, 'change', { ...payload, type: 'update' });
        }
        return findById(id);
      },
    );
  };

  const remove = async (id) => {
    return withRemote(
      async () => {
        await apiRequest(`/entities/${remoteEntity}/${id}`, { method: 'DELETE' });
        const payload = { id };
        dispatchEvent(storageKey, 'remove', payload);
        dispatchEvent(storageKey, 'change', { ...payload, type: 'remove' });
        return true;
      },
      () => {
        const previousLength = data.length;
        data = data.filter((item) => String(item.id) !== String(id));
        if (data.length !== previousLength) {
          persist();
          const payload = { id };
          dispatchEvent(storageKey, 'remove', payload);
          dispatchEvent(storageKey, 'change', { ...payload, type: 'remove' });
        }
        return data.length !== previousLength;
      },
    );
  };

  const withRemote = async (remoteCall, localCall) => {
    if (!remoteEntity || !isApiReady()) {
      if (isLocalDataFallbackEnabled()) {
        return localCall();
      }
      throw new Error(`API session is required for ${storageKey}.`);
    }

    try {
      return await remoteCall();
    } catch (error) {
      if (!isLocalDataFallbackEnabled()) {
        throw error;
      }
      console.warn(`API unavailable for ${storageKey}, using local data.`, error);
      return localCall();
    }
  };

  const setAll = (nextData) => {
    data = clone(nextData);
    persist();
    dispatchEvent(storageKey, 'change', { type: 'setAll', records: clone(data) });
  };

  const subscribe = (eventName, handler) => {
    if (!isBrowser || typeof handler !== 'function') {
      return () => {};
    }

    const eventKey = `${storageKey}:${eventName}`;
    const listener = (event) => handler(event.detail);
    window.addEventListener(eventKey, listener);
    return () => window.removeEventListener(eventKey, listener);
  };

  return {
    list,
    filter,
    findById,
    create,
    update,
    remove,
    setAll,
    subscribe,
    getAll: () => clone(data),
  };
}

