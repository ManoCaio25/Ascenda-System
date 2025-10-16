export const users = [
  {
    id: 1,
    full_name: 'Marina Costa',
    email: 'marina.costa@ascenda.com',
    role: 'Manager'
  }
];

export const interns = [
  {
    id: 'caio',
    full_name: 'Caio Menezes',
    avatar: '/avatars/caio.jpg',
    avatar_url: '🧑‍💻',
    email: 'caio.menezes@ascenda.com',
    level: 'Journeyman',
    status: 'active',
    track: 'JavaScript + React',
    cohort: '2024.2',
    mentor_name: 'Helena Prado',
    points: 820,
    avg_score_pct: 84,
    well_being_status: 'Good',
    start_date: '2024-02-05T00:00:00.000Z',
    end_date: '2024-12-20T00:00:00.000Z',
    skills: ['JavaScript', 'React'],
    performance_history: [
      { date: '2024-03-01', score: 78 },
      { date: '2024-04-01', score: 82 },
      { date: '2024-05-01', score: 84 },
      { date: '2024-06-01', score: 86 },
      { date: '2024-07-01', score: 88 },
      { date: '2024-08-01', score: 90 }
    ]
  },
  {
    id: 'gabriela',
    full_name: 'Gabriela Gomes',
    avatar: '/avatars/gabriela.jpg',
    avatar_url: '🗂️',
    email: 'gabriela.gomes@ascenda.com',
    level: 'Apprentice',
    status: 'active',
    track: 'SAP + PMO',
    cohort: '2024.2',
    mentor_name: 'João Freitas',
    points: 610,
    avg_score_pct: 78,
    well_being_status: 'Neutral',
    start_date: '2024-03-11T00:00:00.000Z',
    end_date: '2025-01-17T00:00:00.000Z',
    skills: ['SAP', 'PMO'],
    performance_history: [
      { date: '2024-03-01', score: 70 },
      { date: '2024-04-01', score: 74 },
      { date: '2024-05-01', score: 77 },
      { date: '2024-06-01', score: 78 },
      { date: '2024-07-01', score: 79 },
      { date: '2024-08-01', score: 82 }
    ]
  },
  {
    id: 'ana',
    full_name: 'Ana Carolina',
    avatar: '/avatars/ana.jpg',
    avatar_url: '🧾',
    email: 'ana.carolina@ascenda.com',
    level: 'Apprentice',
    status: 'paused',
    track: 'SAP + PMO',
    cohort: '2024.2',
    mentor_name: 'João Freitas',
    points: 595,
    avg_score_pct: 75,
    well_being_status: 'Neutral',
    start_date: '2024-04-01T00:00:00.000Z',
    end_date: '2025-02-14T00:00:00.000Z',
    skills: ['SAP', 'PMO'],
    performance_history: [
      { date: '2024-04-01', score: 70 },
      { date: '2024-05-01', score: 72 },
      { date: '2024-06-01', score: 74 },
      { date: '2024-07-01', score: 76 },
      { date: '2024-08-01', score: 78 },
      { date: '2024-09-01', score: 80 }
    ]
  },
  {
    id: 'leticia',
    full_name: 'Leticia Alvez',
    avatar: '/avatars/leticia.jpg',
    avatar_url: '📊',
    email: 'leticia.alvez@ascenda.com',
    level: 'Novice',
    status: 'active',
    track: 'Power BI',
    cohort: '2024.3',
    mentor_name: 'Marina Costa',
    points: 510,
    avg_score_pct: 71,
    well_being_status: 'Neutral',
    start_date: '2024-05-06T00:00:00.000Z',
    end_date: '2025-03-28T00:00:00.000Z',
    skills: ['Power BI'],
    performance_history: [
      { date: '2024-05-01', score: 64 },
      { date: '2024-06-01', score: 68 },
      { date: '2024-07-01', score: 70 },
      { date: '2024-08-01', score: 72 },
      { date: '2024-09-01', score: 73 },
      { date: '2024-10-01', score: 75 }
    ]
  },
  {
    id: 'lucas',
    full_name: 'Lucas Oliveira',
    avatar: '/avatars/lucas.jpg',
    avatar_url: '🤖',
    email: 'lucas.oliveira@ascenda.com',
    level: 'Journeyman',
    status: 'active',
    track: 'AI + Python',
    cohort: '2024.1',
    mentor_name: 'Ana Ribeiro',
    points: 670,
    avg_score_pct: 80,
    well_being_status: 'Excellent',
    start_date: '2024-02-19T00:00:00.000Z',
    end_date: '2024-12-06T00:00:00.000Z',
    skills: ['Python', 'AI'],
    performance_history: [
      { date: '2024-03-01', score: 76 },
      { date: '2024-04-01', score: 79 },
      { date: '2024-05-01', score: 81 },
      { date: '2024-06-01', score: 83 },
      { date: '2024-07-01', score: 85 },
      { date: '2024-08-01', score: 87 }
    ]
  }
];

export const courses = [
  {
    id: 1,
    title: 'React Performance Masterclass',
    description: 'Learn advanced patterns and profiling strategies to deliver snappy React applications.',
    category: 'Technical',
    difficulty: 'Advanced',
    duration_hours: 6,
    created_date: '2024-05-20T10:00:00.000Z',
    enrolled_count: 42,
    completion_rate: 68,
    published: true,
    youtube_url: 'https://www.youtube.com/watch?v=dpw9EHDh2bM',
    youtube_video_id: 'dpw9EHDh2bM'
  },
  {
    id: 2,
    title: 'Data Storytelling Fundamentals',
    description: 'Transform complex analysis into compelling narratives that influence stakeholders.',
    category: 'Communication',
    difficulty: 'Intermediate',
    duration_hours: 4,
    created_date: '2024-04-12T09:00:00.000Z',
    enrolled_count: 36,
    completion_rate: 74,
    published: true,
    file_url: '/docs/data-storytelling.pdf',
    file_name: 'data-storytelling.pdf'
  },
  {
    id: 3,
    title: 'Empathy Driven Customer Success',
    description: 'Build long lasting relationships by combining active listening with proactive engagement.',
    category: 'Leadership',
    difficulty: 'Beginner',
    duration_hours: 3,
    created_date: '2024-03-18T14:00:00.000Z',
    enrolled_count: 28,
    completion_rate: 61,
    published: true
  }
];

export const courseAssignments = [
  {
    id: 1,
    intern_id: 'caio',
    course_id: 1,
    status: 'in_progress',
    progress: 55,
    assigned_by: 'marina.costa@ascenda.com',
    assigned_date: '2024-07-01T08:00:00.000Z',
    due_date: '2024-09-01T00:00:00.000Z',
    notes: 'Focus on the memoization section first.'
  },
  {
    id: 2,
    intern_id: 'gabriela',
    course_id: 2,
    status: 'assigned',
    progress: 0,
    assigned_by: 'marina.costa@ascenda.com',
    assigned_date: '2024-08-10T10:00:00.000Z',
    due_date: '2024-09-30T00:00:00.000Z'
  },
  {
    id: 3,
    intern_id: 'lucas',
    course_id: 3,
    status: 'completed',
    progress: 100,
    assigned_by: 'marina.costa@ascenda.com',
    assigned_date: '2024-04-02T10:00:00.000Z',
    started_date: '2024-04-05T10:00:00.000Z',
    completed_date: '2024-05-15T10:00:00.000Z'
  }
];

export const tasks = [
  {
    id: 1,
    intern_id: 'caio',
    title: 'Ship performance audit',
    status: 'completed',
    due_date: '2024-07-15T00:00:00.000Z'
  },
  {
    id: 2,
    intern_id: 'caio',
    title: 'Refine onboarding flows',
    status: 'in_progress',
    due_date: '2024-09-01T00:00:00.000Z'
  },
  {
    id: 3,
    intern_id: 'gabriela',
    title: 'Customer feedback analysis',
    status: 'pending',
    due_date: '2024-08-28T00:00:00.000Z'
  },
  {
    id: 4,
    intern_id: 'ana',
    title: 'PMO cadence deck refresh',
    status: 'in_progress',
    due_date: '2024-09-05T00:00:00.000Z'
  },
  {
    id: 5,
    intern_id: 'leticia',
    title: 'Power BI revenue dashboard',
    status: 'pending',
    due_date: '2024-09-10T00:00:00.000Z'
  },
  {
    id: 6,
    intern_id: 'lucas',
    title: 'Prototype AI assistant workflow',
    status: 'completed',
    due_date: '2024-08-01T00:00:00.000Z'
  }
];

export const feedbackEntries = [
  {
    id: 1,
    intern_id: 'caio',
    title: 'Revisão da Sprint 18',
    message: 'Ótima evolução nas métricas de performance. Continue explorando memoization no próximo ciclo.',
    sentiment: 'positive',
    status: 'acknowledged',
    author: 'Helena Prado',
    created_at: '2024-08-12T14:30:00.000Z'
  },
  {
    id: 2,
    intern_id: 'caio',
    title: 'Feedback de Code Review',
    message: 'Ajustar nomenclaturas e adicionar testes para o hook de analytics antes do merge.',
    sentiment: 'action',
    status: 'pending',
    author: 'Helena Prado',
    created_at: '2024-08-15T09:10:00.000Z'
  },
  {
    id: 3,
    intern_id: 'gabriela',
    title: 'Workshop PMO',
    message: 'Excelente facilitação do workshop. Documentar aprendizados no Confluence até sexta-feira.',
    sentiment: 'positive',
    status: 'acknowledged',
    author: 'João Freitas',
    created_at: '2024-08-10T11:45:00.000Z'
  },
  {
    id: 4,
    intern_id: 'leticia',
    title: 'Painel de BI',
    message: 'Validar se os filtros cruzados estão entregando os números esperados antes da apresentação.',
    sentiment: 'neutral',
    status: 'in_progress',
    author: 'Marina Costa',
    created_at: '2024-08-14T17:05:00.000Z'
  },
  {
    id: 5,
    intern_id: 'lucas',
    title: 'Protótipo Assistente IA',
    message: 'Reforçar casos de teste voltados a dados sensíveis e alinhar com o time de segurança.',
    sentiment: 'action',
    status: 'pending',
    author: 'Ana Ribeiro',
    created_at: '2024-08-16T15:20:00.000Z'
  }
];

export const notifications = [
  {
    id: 1,
    type: 'course_assigned',
    title: 'New Course Assigned',
    body: 'Caio Menezes received "React Performance Masterclass".',
    target_id: 1,
    target_kind: 'course',
    actor_name: 'Marina Costa',
    created_date: '2024-08-12T12:20:00.000Z',
    read: false
  },
  {
    id: 2,
    type: 'vacation_status_changed',
    title: 'Vacation Request Approved',
    body: 'Gabriela Gomes will be on vacation from Sep 10 to Sep 13.',
    target_id: 2,
    target_kind: 'request',
    actor_name: 'Marina Costa',
    created_date: '2024-08-10T09:00:00.000Z',
    read: true
  },
  {
    id: 3,
    type: 'intern_paused',
    title: 'Intern paused',
    body: 'Ana Carolina learning journey paused by mentor.',
    target_id: 'ana',
    target_kind: 'intern',
    actor_name: 'João Freitas',
    created_date: '2024-07-22T14:30:00.000Z',
    read: false
  }
];

export const vacationRequests = [
  {
    id: 1,
    intern_id: 'caio',
    status: 'approved',
    start_date: '2024-08-26T00:00:00.000Z',
    end_date: '2024-08-30T00:00:00.000Z',
    created_date: '2024-07-18T09:30:00.000Z',
    decided_at: '2024-07-22T10:00:00.000Z',
    manager_note: 'Aproveite a folga e volte com energia!'
  },
  {
    id: 2,
    intern_id: 'gabriela',
    status: 'pending',
    start_date: '2024-09-10T00:00:00.000Z',
    end_date: '2024-09-13T00:00:00.000Z',
    created_date: '2024-08-05T11:00:00.000Z',
    reason: 'Family trip to visit grandparents.'
  },
  {
    id: 3,
    intern_id: 'lucas',
    status: 'rejected',
    start_date: '2024-09-02T00:00:00.000Z',
    end_date: '2024-09-06T00:00:00.000Z',
    created_date: '2024-08-08T10:30:00.000Z',
    decided_at: '2024-08-10T09:00:00.000Z',
    manager_note: 'Vamos precisar de você no hackathon interno.'
  }
];

export const chatMessages = [
  {
    id: 1,
    intern_id: 'caio',
    from: 'intern',
    text: 'Oi! Você poderia revisar o meu último pull request? 😊',
    created_date: '2024-08-14T13:12:00.000Z',
    read: false
  },
  {
    id: 2,
    intern_id: 'caio',
    from: 'manager',
    text: 'Claro! Vou olhar ainda hoje e te aviso.',
    created_date: '2024-08-14T13:18:00.000Z',
    read: true
  },
  {
    id: 3,
    intern_id: 'gabriela',
    from: 'intern',
    text: 'Terminei o estudo de caso. Podemos conversar amanhã?',
    created_date: '2024-08-13T09:45:00.000Z',
    read: true
  },
  {
    id: 4,
    intern_id: 'lucas',
    from: 'intern',
    text: 'Enviei o protótipo do assistente, feedbacks são bem-vindos!',
    created_date: '2024-08-15T15:05:00.000Z',
    read: false
  }
];

