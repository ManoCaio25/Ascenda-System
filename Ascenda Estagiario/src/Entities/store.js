const isBrowser = typeof window !== 'undefined';

const clone = (value) => JSON.parse(JSON.stringify(value));

const readStorage = (key, fallback) => {
  if (!isBrowser) return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn(`Failed to read storage for ${key}:`, error);
  }
  return fallback;
};

const writeStorage = (key, value) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to write storage for ${key}:`, error);
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

export function createEntityStore(storageKey, initialData = []) {
  let data = readStorage(storageKey, clone(initialData));

  const persist = () => writeStorage(storageKey, data);

  const nextId = () => {
    const numericIds = data.map((item) => Number(item.id) || 0);
    return (numericIds.length ? Math.max(...numericIds) : 0) + 1;
  };

  const list = async (sort, limit) => {
    const items = sortBy([...data], sort);
    const sliced = typeof limit === 'number' ? items.slice(0, limit) : items;
    return clone(sliced);
  };

  const filter = async (criteria = {}, sort, limit) => {
    let items = data.filter((item) => matchesCriteria(item, criteria));
    items = sortBy(items, sort);
    if (typeof limit === 'number') {
      items = items.slice(0, limit);
    }
    return clone(items);
  };

  const findById = async (id) => {
    const match = data.find((item) => String(item.id) === String(id));
    return match ? clone(match) : null;
  };

  const create = async (record) => {
    const item = {
      ...record,
      id: record?.id ?? nextId(),
    };
    if (!item.created_date) {
      item.created_date = new Date().toISOString();
    }
    data = [...data, item];
    persist();
    return clone(item);
  };

  const update = async (id, updates) => {
    const cleaned = cleanUpdates(updates);
    let updated = null;
    data = data.map((item) => {
      if (String(item.id) === String(id)) {
        updated = { ...item, ...cleaned };
        return updated;
      }
      return item;
    });
    if (!updated) return null;
    persist();
    return clone(updated);
  };

  const remove = async (id) => {
    const previousLength = data.length;
    data = data.filter((item) => String(item.id) !== String(id));
    if (data.length !== previousLength) {
      persist();
      return true;
    }
    return false;
  };

  return {
    list,
    filter,
    findById,
    create,
    update,
    remove,
  };
}
