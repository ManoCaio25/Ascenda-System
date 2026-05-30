import { apiRequest, isApiReady, isLocalDataFallbackEnabled } from '../services/apiClient';

const isBrowser = typeof window !== 'undefined';

const clone = (value) => JSON.parse(JSON.stringify(value));

const REMOTE_ENTITY_BY_STORAGE_KEY = {
  ascenda_estagiario_users: 'interns',
  ascenda_estagiario_tasks: 'tasks',
  ascenda_estagiario_learning_paths: 'learningPaths',
  ascenda_estagiario_contents: 'contents',
  ascenda_estagiario_forum_categories: 'forumCategories',
  ascenda_estagiario_forum_topics: 'forumTopics',
  ascenda_estagiario_forum_replies: 'forumReplies',
  ascenda_estagiario_calendar_events: 'calendarEvents',
  ascenda_estagiario_activities: 'activities',
  ascenda_estagiario_achievements: 'badges',
  ascenda_estagiario_shop_items: 'shopItems',
};

const TASK_STATUS_TO_LEGACY = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  in_review: 'Aguardando Revisao',
  completed: 'Concluida',
  overdue: 'Pendente',
  paused: 'Pendente',
};

const LEGACY_TASK_STATUS_TO_REMOTE = {
  Pendente: 'pending',
  'Em Andamento': 'in_progress',
  'Aguardando Revisao': 'in_review',
  Concluida: 'completed',
};

const FIELD_MAPPERS = {
  ascenda_estagiario_users: {
    fromRemote: (item) => ({
      ...item,
      area_atuacao: item.track || item.area_atuacao,
      pontos_gamificacao: item.points ?? item.pontos_gamificacao,
    }),
  },
  ascenda_estagiario_tasks: {
    fromRemote: (item) => ({
      ...item,
      titulo_demanda: item.titulo_demanda ?? item.title,
      descricao: item.descricao ?? item.description,
      status_demanda: item.status_demanda ?? TASK_STATUS_TO_LEGACY[item.status] ?? item.status,
      data_limite: item.data_limite ?? item.due_date,
      pontos_gamificacao_associados: item.pontos_gamificacao_associados ?? item.points_reward,
      created_date: item.created_date ?? item.created_at,
    }),
    toRemote: (item) => {
      const {
        titulo_demanda,
        descricao,
        status_demanda,
        data_limite,
        pontos_gamificacao_associados,
        created_date,
        ...rest
      } = item;
      return {
        ...rest,
        ...(titulo_demanda !== undefined ? { title: titulo_demanda } : {}),
        ...(descricao !== undefined ? { description: descricao } : {}),
        ...(status_demanda !== undefined ? { status: LEGACY_TASK_STATUS_TO_REMOTE[status_demanda] || status_demanda } : {}),
        ...(data_limite !== undefined ? { due_date: data_limite } : {}),
        ...(pontos_gamificacao_associados !== undefined ? { points_reward: pontos_gamificacao_associados } : {}),
      };
    },
    sortAliases: {
      created_date: 'created_at',
      data_limite: 'due_date',
    },
    criteriaAliases: {
      status_demanda: 'status',
      data_limite: 'due_date',
    },
  },
  ascenda_estagiario_learning_paths: {
    fromRemote: (item) => ({
      ...item,
      nome_trilha: item.nome_trilha ?? item.name,
      descricao: item.descricao ?? item.description,
      created_date: item.created_date ?? item.created_at,
    }),
    sortAliases: { created_date: 'created_at' },
  },
  ascenda_estagiario_contents: {
    fromRemote: (item) => ({
      ...item,
      titulo: item.titulo ?? item.title,
      descricao: item.descricao ?? item.description,
      tipo_conteudo: item.tipo_conteudo ?? item.content_type,
      duracao_estimada_minutos: item.duracao_estimada_minutos ?? item.estimated_minutes,
      status_conclusao: item.status_conclusao ?? item.completion_status,
      ordem_na_trilha: item.ordem_na_trilha ?? item.order_index,
      url_acesso: item.url_acesso ?? item.access_url,
      created_date: item.created_date ?? item.created_at,
    }),
    sortAliases: { created_date: 'created_at' },
  },
  ascenda_estagiario_forum_categories: {
    fromRemote: (item) => ({
      ...item,
      nome_categoria: item.nome_categoria ?? item.name,
      descricao: item.descricao ?? item.description,
      created_date: item.created_date ?? item.created_at,
    }),
    sortAliases: { created_date: 'created_at' },
  },
  ascenda_estagiario_forum_topics: {
    fromRemote: (item) => ({
      ...item,
      id_categoria_forum: item.id_categoria_forum ?? item.category_id,
      titulo: item.titulo ?? item.title,
      conteudo_topico: item.conteudo_topico ?? item.content,
      id_usuario_criador: item.id_usuario_criador ?? item.creator_id,
      visualizacoes: item.visualizacoes ?? item.views,
      created_date: item.created_date ?? item.created_at,
    }),
    toRemote: (item) => {
      const { id_categoria_forum, titulo, conteudo_topico, id_usuario_criador, visualizacoes, created_date, ...rest } = item;
      return {
        ...rest,
        ...(id_categoria_forum !== undefined ? { category_id: id_categoria_forum } : {}),
        ...(titulo !== undefined ? { title: titulo } : {}),
        ...(conteudo_topico !== undefined ? { content: conteudo_topico } : {}),
        ...(id_usuario_criador !== undefined ? { creator_id: id_usuario_criador } : {}),
        ...(visualizacoes !== undefined ? { views: visualizacoes } : {}),
      };
    },
    sortAliases: { created_date: 'created_at' },
    criteriaAliases: { id_categoria_forum: 'category_id', id_usuario_criador: 'creator_id' },
  },
  ascenda_estagiario_forum_replies: {
    fromRemote: (item) => ({
      ...item,
      id_topico: item.id_topico ?? item.topic_id,
      conteudo_resposta: item.conteudo_resposta ?? item.content,
      id_usuario_criador: item.id_usuario_criador ?? item.creator_id,
      melhor_resposta: item.melhor_resposta ?? item.best_answer,
      created_date: item.created_date ?? item.created_at,
    }),
    toRemote: (item) => {
      const { id_topico, conteudo_resposta, id_usuario_criador, melhor_resposta, created_date, ...rest } = item;
      return {
        ...rest,
        ...(id_topico !== undefined ? { topic_id: id_topico } : {}),
        ...(conteudo_resposta !== undefined ? { content: conteudo_resposta } : {}),
        ...(id_usuario_criador !== undefined ? { creator_id: id_usuario_criador } : {}),
        ...(melhor_resposta !== undefined ? { best_answer: melhor_resposta } : {}),
      };
    },
    sortAliases: { created_date: 'created_at' },
    criteriaAliases: { id_topico: 'topic_id', id_usuario_criador: 'creator_id' },
  },
  ascenda_estagiario_calendar_events: {
    fromRemote: (item) => ({
      ...item,
      titulo_evento: item.titulo_evento ?? item.title,
      descricao: item.descricao ?? item.description,
      data_hora_inicio: item.data_hora_inicio ?? item.starts_at,
      data_hora_fim: item.data_hora_fim ?? item.ends_at,
      tipo_evento: item.tipo_evento ?? item.event_type,
      created_date: item.created_date ?? item.created_at,
    }),
    sortAliases: { created_date: 'created_at', data_hora_inicio: 'starts_at' },
  },
  ascenda_estagiario_activities: {
    fromRemote: (item) => ({
      ...item,
      titulo: item.titulo ?? item.title,
      descricao: item.descricao ?? item.description,
      prazo_resposta: item.prazo_resposta ?? item.due_at,
      categoria: item.categoria ?? item.category,
      created_date: item.created_date ?? item.created_at,
    }),
    sortAliases: { created_date: 'created_at', prazo_resposta: 'due_at' },
  },
  ascenda_estagiario_achievements: {
    fromRemote: (item) => ({
      ...item,
      nome_conquista: item.nome_conquista ?? item.name,
      descricao: item.descricao ?? item.description,
      url_icone: item.url_icone ?? item.icon_url,
      raridade: item.raridade ?? item.rarity,
      created_date: item.created_date ?? item.achieved_at,
    }),
    sortAliases: { created_date: 'achieved_at' },
  },
  ascenda_estagiario_shop_items: {
    fromRemote: (item) => ({
      ...item,
      nome_item: item.nome_item ?? item.name,
      descricao: item.descricao ?? item.description,
      url_imagem: item.url_imagem ?? item.image_url,
      custo_pontos: item.custo_pontos ?? item.cost_points,
      tipo_item: item.tipo_item ?? item.item_type,
      raridade: item.raridade ?? item.rarity,
      created_date: item.created_date ?? item.created_at,
    }),
    sortAliases: { created_date: 'created_at' },
  },
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

const mapperFor = (storageKey) => FIELD_MAPPERS[storageKey] || {};

const fromRemote = (storageKey, value) => {
  const mapper = mapperFor(storageKey).fromRemote || ((item) => item);
  return Array.isArray(value) ? value.map(mapper) : mapper(value);
};

const toRemote = (storageKey, value) => {
  const mapper = mapperFor(storageKey).toRemote || ((item) => item);
  return mapper(value);
};

const remoteField = (storageKey, field) => {
  const mapper = mapperFor(storageKey);
  return mapper.sortAliases?.[field] || mapper.criteriaAliases?.[field] || field;
};

const remoteCriterionValue = (storageKey, key, value) => {
  if (storageKey === 'ascenda_estagiario_tasks' && key === 'status_demanda') {
    return LEGACY_TASK_STATUS_TO_REMOTE[value] || value;
  }
  return value;
};

const appendQuery = (path, params) => {
  const query = params.toString();
  return query ? `${path}?${query}` : path;
};

const canSendCriterion = (value) => (
  value == null ||
  ['string', 'number', 'boolean'].includes(typeof value)
);

const buildListPath = (storageKey, entity, { criteria, sort, limit } = {}) => {
  const params = new URLSearchParams();
  let requiresClientFilter = false;

  if (sort) {
    const desc = sort.startsWith('-');
    const field = desc ? sort.slice(1) : sort;
    params.set('order', remoteField(storageKey, field));
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
      params.set(remoteField(storageKey, key), String(remoteCriterionValue(storageKey, key, value)));
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
        const { path } = buildListPath(storageKey, remoteEntity, { sort, limit });
        return fromRemote(storageKey, await apiRequest(path));
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
        const { path, requiresClientFilter } = buildListPath(storageKey, remoteEntity, { criteria, sort, limit });
        let items = fromRemote(storageKey, await apiRequest(path));
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
      async () => fromRemote(storageKey, await apiRequest(`/entities/${remoteEntity}/${id}`)),
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
        const created = fromRemote(storageKey, await apiRequest(`/entities/${remoteEntity}`, {
          method: 'POST',
          body: toRemote(storageKey, item),
        }));
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
        const updated = fromRemote(storageKey, await apiRequest(`/entities/${remoteEntity}/${id}`, {
          method: 'PATCH',
          body: toRemote(storageKey, cleaned),
        }));
        const payload = { id, record: clone(updated) };
        dispatchEvent(storageKey, 'update', payload);
        dispatchEvent(storageKey, 'change', { ...payload, type: 'update' });
        return updated;
      },
      () => {
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
        if (updated) {
          const payload = { id, record: clone(updated) };
          dispatchEvent(storageKey, 'update', payload);
          dispatchEvent(storageKey, 'change', { ...payload, type: 'update' });
        }
        return clone(updated);
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
          return true;
        }
        return false;
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
    subscribe,
  };
}
