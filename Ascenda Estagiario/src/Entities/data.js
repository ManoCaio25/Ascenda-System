export const users = [
  {
    id: 'intern-1',
    full_name: 'Caio Menezes',
    email: 'caio.alvarenga@ascenda.com',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face',
    area_atuacao: 'Frontend Development',
    pontos_gamificacao: 2847,
    equipped_tag: '🚀 Cosmic Explorer'
  },
  {
    id: 'intern-2',
    full_name: 'Leticia Alvez',
    email: 'leticia.alvez@ascenda.com',
    avatar_url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=120&h=120&fit=crop&crop=center&auto=format',
    area_atuacao: 'Power BI Analytics',
    pontos_gamificacao: 2384,
    equipped_tag: '🦈 Shark Visionary'
  },
  {
    id: 'intern-3',
    full_name: 'Iasmin Duarte',
    email: 'iasmin.duarte@ascenda.com',
    avatar_url: 'https://lumiere-a.akamaihd.net/v1/images/open-uri20150608-27674-1p3tzg5_3c9f2b2f.jpeg?region=0%2C0%2C450%2C450&width=200',
    area_atuacao: 'Customer Success & CX',
    pontos_gamificacao: 2216,
    equipped_tag: '🌺 Ohana Guide'
  },
  {
    id: 'manager-1',
    full_name: 'Paulo Henrique',
    email: 'paulo.henrique@ascenda.com',
    avatar_url: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2536830/header.jpg',
    area_atuacao: 'Program Management',
    pontos_gamificacao: 3620,
    equipped_tag: '🎭 Clair Obscur Maestro'
  }
];

export const tasks = [
  {
    id: 'task-1',
    titulo_demanda: 'Complete React Components Tutorial',
    descricao: 'Finalize the interactive components for the onboarding journey.',
    status_demanda: 'Em Andamento',
    data_limite: '2024-11-22',
    pontos_gamificacao_associados: 150,
    priority: 'high'
  },
  {
    id: 'task-2',
    titulo_demanda: 'Submit Weekly Report',
    descricao: 'Share blockers and highlights for the current sprint.',
    status_demanda: 'Pendente',
    data_limite: '2024-11-18',
    pontos_gamificacao_associados: 50,
    priority: 'medium'
  },
  {
    id: 'task-3',
    titulo_demanda: 'Review Code Documentation',
    descricao: 'Polish README and ADRs for the analytics service.',
    status_demanda: 'Pendente',
    data_limite: '2024-11-25',
    pontos_gamificacao_associados: 80,
    priority: 'low'
  },
  {
    id: 'task-4',
    titulo_demanda: 'Prepare Demo Slide Deck',
    descricao: 'Draft the slides for the next mentorship sync.',
    status_demanda: 'Aguardando Revisao',
    data_limite: '2024-11-20',
    pontos_gamificacao_associados: 120,
    priority: 'high'
  },
  {
    id: 'task-5',
    titulo_demanda: 'Publish Knowledge Base Article',
    descricao: 'Summarize recent learnings about design systems.',
    status_demanda: 'Concluida',
    data_limite: '2024-11-10',
    pontos_gamificacao_associados: 90,
    priority: 'medium'
  }
];

export const learningPaths = [
  {
    id: 'lp-1',
    nome_trilha: 'Cosmic Frontend Journey',
    descricao: 'Master interface craftsmanship with React, animations and accessibility.',
    progress_percent: 68,
    created_date: '2024-09-01T00:00:00.000Z'
  }
];

export const contents = [
  {
    id: 'content-1',
    titulo: 'Designing Delightful Dashboards',
    descricao: 'Narrative-driven overview of layout principles for analytics screens.',
    tipo_conteudo: 'Video',
    duracao_estimada_minutos: 18,
    status_conclusao: 'Concluido',
    ordem_na_trilha: 1,
    url_acesso: 'https://www.youtube.com/watch?v=WXsD0ZgxjRw',
    level: 'Basic'
  },
  {
    id: 'content-2',
    titulo: 'Micro-interactions with Framer Motion',
    descricao: 'Hands-on session to add polish through purposeful motion.',
    tipo_conteudo: 'Video',
    duracao_estimada_minutos: 22,
    status_conclusao: 'Em Progresso',
    ordem_na_trilha: 2,
    url_acesso: 'https://www.youtube.com/watch?v=0zIYyH6J5_Y',
    level: 'Medium'
  },
  {
    id: 'content-3',
    titulo: 'Accessible Component Checklist',
    descricao: 'Reference PDF covering WCAG-friendly patterns for common widgets.',
    tipo_conteudo: 'PDF',
    duracao_estimada_minutos: 15,
    status_conclusao: 'Pendente',
    ordem_na_trilha: 3,
    url_acesso: '',
    level: 'Medium'
  },
  {
    id: 'content-4',
    titulo: 'Integrating Design Tokens',
    descricao: 'Article that explains how to scale brand foundations across products.',
    tipo_conteudo: 'Link Externo',
    duracao_estimada_minutos: 12,
    status_conclusao: 'Pendente',
    ordem_na_trilha: 4,
    url_acesso: 'https://uxdesign.cc/',
    level: 'Advanced'
  }
];

export const forumCategories = [
  {
    id: 'cat-1',
    nome_categoria: 'Technical Questions',
    descricao: 'Troubleshoot code, tooling and deployment challenges.',
    topic_count: 18
  },
  {
    id: 'cat-2',
    nome_categoria: 'Career Development',
    descricao: 'Share mentoring advice, feedback rituals and growth stories.',
    topic_count: 12
  },
  {
    id: 'cat-3',
    nome_categoria: 'Project Showcase',
    descricao: 'Highlight creative experiments and side missions.',
    topic_count: 9
  },
  {
    id: 'cat-4',
    nome_categoria: 'General Discussion',
    descricao: 'Casual conversations, wellness tips and cultural moments.',
    topic_count: 21
  }
];

export const forumTopics = [
  {
    id: 'topic-1',
    id_categoria_forum: 'cat-1',
    titulo: 'Best approach to share Zustand stores across microfrontends?',
    conteudo_topico: 'I am orchestrating multiple modules and need tips for state hydration.',
    created_date: '2024-11-05T10:00:00.000Z',
    id_usuario_criador: 'user_1',
    visualizacoes: 132,
    reply_count: 5
  },
  {
    id: 'topic-2',
    id_categoria_forum: 'cat-2',
    titulo: 'How do you prepare for mentor syncs effectively?',
    conteudo_topico: 'Looking for templates and rituals that keep meetings energizing.',
    created_date: '2024-11-08T14:30:00.000Z',
    id_usuario_criador: 'user_2',
    visualizacoes: 78,
    reply_count: 3
  },
  {
    id: 'topic-3',
    id_categoria_forum: 'cat-3',
    titulo: 'Show and tell: AI powered UI generator',
    conteudo_topico: 'Sharing the prototype we hacked together for the cosmic challenge.',
    created_date: '2024-11-03T09:20:00.000Z',
    id_usuario_criador: 'user_3',
    visualizacoes: 204,
    reply_count: 7
  }
];

export const forumReplies = [
  {
    id: 'reply-1',
    id_topico: 'topic-1',
    conteudo_resposta: 'We package the store into a bridge component so only the shell owns routing.',
    id_usuario_criador: 'user_2',
    created_date: '2024-11-05T15:45:00.000Z',
    melhor_resposta: true
  },
  {
    id: 'reply-2',
    id_topico: 'topic-1',
    conteudo_resposta: 'Consider persisting slices separately to avoid over-hydrating.',
    id_usuario_criador: 'user_3',
    created_date: '2024-11-05T17:10:00.000Z',
    melhor_resposta: false
  },
  {
    id: 'reply-3',
    id_topico: 'topic-2',
    conteudo_resposta: 'I send a one-pager before meetings with highlights, lows and asks.',
    id_usuario_criador: 'user_1',
    created_date: '2024-11-09T09:00:00.000Z',
    melhor_resposta: false
  }
];

export const calendarEvents = [
  {
    id: 'event-1',
    titulo_evento: 'Mentor Sync',
    descricao: 'Discuss sprint progress and unblockers with mentor.',
    data_hora_inicio: '2024-11-19T13:00:00.000Z',
    data_hora_fim: '2024-11-19T14:00:00.000Z',
    tipo_evento: 'meeting'
  },
  {
    id: 'event-2',
    titulo_evento: 'Learning Path Checkpoint',
    descricao: 'Review progress on the Cosmic Frontend Journey.',
    data_hora_inicio: '2024-11-21T16:30:00.000Z',
    data_hora_fim: '2024-11-21T17:00:00.000Z',
    tipo_evento: 'learning'
  },
  {
    id: 'event-3',
    titulo_evento: 'Community Demo Day',
    descricao: 'Showcase prototypes with the cohort.',
    data_hora_inicio: '2024-11-25T18:00:00.000Z',
    data_hora_fim: '2024-11-25T19:30:00.000Z',
    tipo_evento: 'community'
  },
  {
    id: 'event-4',
    titulo_evento: 'Focus Sprint',
    descricao: 'Heads-down time reserved for prototype polish.',
    data_hora_inicio: '2024-11-27T09:00:00.000Z',
    data_hora_fim: '2024-11-27T12:00:00.000Z',
    tipo_evento: 'focus'
  }
];

export const activities = [
  {
    id: 'activity-1',
    titulo: 'Daily Orbital Check-in',
    descricao: 'Compartilhe seu destaque do dia, um aprendizado e um possível bloqueio.',
    prazo_resposta: '2024-11-19T17:00:00.000Z',
    mentor: 'Isabela Novaes',
    status: 'open',
    categoria: 'ritual',
    respostas: [
      {
        id: 'response-1',
        autor: 'Isabela Novaes',
        conteudo: 'Lembre-se de anexar links úteis – isso ajuda toda a tripulação.',
        created_date: '2024-11-18T21:30:00.000Z',
        tipo: 'mentor'
      }
    ]
  },
  {
    id: 'activity-2',
    titulo: 'Mini Projeto: Landing Page Animada',
    descricao: 'Crie uma landing page simples usando framer-motion e compartilhe um GIF com o resultado.',
    prazo_resposta: '2024-11-22T23:59:00.000Z',
    mentor: 'Ravi Sol',
    status: 'in_progress',
    categoria: 'project',
    recursos_sugeridos: ['https://www.framer.com/motion/', 'https://refactoringui.com/'],
    respostas: []
  },
  {
    id: 'activity-3',
    titulo: 'Diário de Aprendizado',
    descricao: 'Escreva três parágrafos sobre como você aplicaria Atomic Design no produto da Ascenda.',
    prazo_resposta: '2024-11-24T20:00:00.000Z',
    mentor: 'Marina Orion',
    status: 'open',
    categoria: 'reflection',
    respostas: [
      {
        id: 'response-2',
        autor: 'Caio Menezes',
        conteudo: 'Foquei em mapear padrões antes de prototipar telas isoladas – ajudou no reuso!',
        created_date: '2024-11-16T18:12:00.000Z',
        tipo: 'intern'
      }
    ]
  }
];

export const achievements = [
  {
    id: 'ach-1',
    nome_conquista: 'Cosmic Collaborator',
    descricao: 'Contributed to three peer reviews in a week.',
    url_icone: '🌌',
    raridade: 'epic',
    progresso: 100
  },
  {
    id: 'ach-2',
    nome_conquista: 'Prototype Wizard',
    descricao: 'Shipped a high fidelity concept in record time.',
    url_icone: '🧙‍♀️',
    raridade: 'rare',
    progresso: 80
  },
  {
    id: 'ach-3',
    nome_conquista: 'Feedback Beacon',
    descricao: 'Facilitated a retrospective with actionable outcomes.',
    url_icone: '🛸',
    raridade: 'uncommon',
    progresso: 45
  },
  {
    id: 'ach-4',
    nome_conquista: 'Design System Cartographer',
    descricao: 'Documentou 10 componentes reutilizáveis com tokens da marca.',
    url_icone: '🗺️',
    raridade: 'legendary',
    progresso: 20
  }
];

export const shopItems = [
  {
    id: 'item-1',
    nome_item: 'Supernova Hoodie',
    descricao: 'Glow-in-the-dark hoodie for late night coding sessions.',
    url_imagem: '✨',
    custo_pontos: 320,
    tipo_item: 'Cosmetic',
    raridade: 'epic',
    estoque: 'limited'
  },
  {
    id: 'item-2',
    nome_item: 'Galactic Explorer Tag',
    descricao: 'Badge that celebrates fearless experimentation.',
    url_imagem: '🚀',
    custo_pontos: 180,
    tipo_item: 'Tag',
    raridade: 'rare',
    estoque: 'available'
  },
  {
    id: 'item-3',
    nome_item: 'Nebula Stickers Pack',
    descricao: 'Decorate your workstation with cosmic vibes.',
    url_imagem: '🌠',
    custo_pontos: 90,
    tipo_item: 'Cosmetic',
    raridade: 'common',
    estoque: 'available'
  },
  {
    id: 'item-4',
    nome_item: 'Aurora Workspace Theme',
    descricao: 'Tema exclusivo para o VSCode inspirado em nebulosas.',
    url_imagem: '🌌',
    custo_pontos: 210,
    tipo_item: 'Digital',
    raridade: 'legendary',
    estoque: 'limited'
  }
];
