import { useState, useEffect, createContext, useContext } from 'react';

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    learningPath: 'Learning Path',
    myTasks: 'My Tasks',
    activities: 'Activities',
    forum: 'Forum',
    calendar: 'Calendar',
    knowledgeBase: 'Knowledge Base',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    navigation: 'Navigation',
    quickActions: 'Quick Actions',

    // Dashboard
    welcomeMessage: 'Ready to Ascend, {name}?',
    welcomeSubtitle: 'Continue your cosmic journey of learning and growth',
    cosmicPoints: 'Cosmic Points',
    activeTasks: 'Active Tasks',
    coursesCompleted: 'Courses Completed',
    learningStreak: 'Learning Streak',
    wellbeingCheckin: 'Well-being Check-in',
    howAreYouFeeling: 'How are you feeling today?',
    availability: 'Availability',
    updateStatus: 'Update Status',
    
    // Tasks
    newTask: 'New Task',
    todo: 'To Do',
    inProgress: 'In Progress', 
    inReview: 'In Review',
    done: 'Done',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    urgent: 'Urgent',
    dueDate: 'Due Date',
    points: 'points',
    
    // Learning
    nextLessons: 'Next Lessons',
    learningProgress: 'Learning Progress',
    viewPath: 'View Path',
    minutes: 'minutes',
    basic: 'Basic',
    advanced: 'Advanced',

    // Activities
    mentorActivitiesTag: 'Mentor activities',
    mentorJourneyTitle: 'Your mentor-guided journey',
    mentorJourneySubtitle: 'Track rituals, missions, and reflections from your padrinho to keep your constellation aligned.',
    activitiesSummaryOpen: 'Open',
    activitiesSummaryCompleted: 'Completed',
    activitiesSummaryNextDeadline: 'Next deadline',
    activitiesNoUpcomingDeadline: 'No upcoming deadlines',
    activitiesFilterLabel: 'Filter by status',
    activitiesFilterAll: 'All',
    activitiesFilterOpen: 'Open',
    activitiesFilterInProgress: 'In progress',
    activitiesFilterCompleted: 'Completed',
    activitiesStatusOpen: 'Open',
    activitiesStatusInProgress: 'In progress',
    activitiesStatusCompleted: 'Completed',
    activitiesDueLabel: 'Due',
    activitiesMentorLabel: 'Mentor: {name}',
    activitiesInteractions: '{count} interactions',
    activitiesResources: 'Suggested resources',
    activitiesRespondCta: 'Respond to activity',
    activitiesMarkComplete: 'Mark as completed',
    activitiesMarkedComplete: 'Delivery recorded',
    activitiesEmptyTitle: 'All clear for now!',
    activitiesEmptyDescription: 'Your mentor has not assigned new activities yet. Use this moment to review your wins.',
    activitiesDialogDetails: 'Due {deadline} · Mentor {mentor}',
    activitiesDialogResponseLabel: 'Your response',
    activitiesDialogResponsePlaceholder: 'Share your insights, attachments, or questions...',
    activitiesDialogLinksLabel: 'Helpful links (optional)',
    activitiesDialogLinksPlaceholder: 'Paste each link on a new line',
    activitiesDialogHistory: 'Interaction history',
    activitiesDialogEmptyHistory: 'Be the first to respond to this activity.',
    activitiesDialogSubmitting: 'Sending...',
    activitiesDialogSubmit: 'Send response',
    activitiesLoadError: 'We had trouble loading mentor activities.',
    activitiesRetry: 'Try again',
    activitiesSubmitError: 'Something went wrong. Please try again.',
    activitiesInternFallback: 'You',

    // Profile
    myBadges: 'My Badges',
    avatarShop: 'Avatar Shop',
    equip: 'Equip',
    equipped: 'Equipped',
    
    // Feelings
    excellent: 'Excellent',
    good: 'Good', 
    neutral: 'Neutral',
    stressed: 'Stressed',
    overwhelmed: 'Overwhelmed',
    
    // Status
    available: 'Available',
    busy: 'Busy',
    inMeeting: 'In Meeting',
    onBreak: 'On Break',
    away: 'Away',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading...',
    viewAll: 'View All',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    highContrast: 'High Contrast',
    language: 'Language',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    goToToday: 'Today',
    requestVacation: 'Request Vacation',
    newEvent: 'New Event',
    upcomingHighlights: 'Upcoming Highlights',
    vacationSummary: 'Vacation Summary',
    businessDays: 'Business days: {count}',
    noVacationPlanned: 'No vacation planned yet',
    vacationDatesRequired: 'Please select the start and end dates.',
    invalidDates: 'The selected dates are not valid.',
    vacationDateOrder: 'The end date must be after the start date.',
    vacationDialogSubtitle: 'Share dates and context so your mentor can support your break.',
    startDate: 'Start date',
    endDate: 'End date',
    vacationReason: 'Reason or plans',
    vacationReasonPlaceholder: 'Tell your mentor how you plan to recharge...',
    handoffNotes: 'Handoff notes',
    handoffPlaceholder: 'List tasks, files or contacts that should stay in motion.',
    submitRequest: 'Submit request',
    filterAll: 'All',
    filterTechnical: 'Technical',
    filterCareer: 'Career',
    filterCommunity: 'Community',
    filterCulture: 'Culture',
    forumWelcome: 'Welcome to the orbit',
    forumTitle: 'Ascenda Forum',
    forumSubtitle: 'Learn from mentors, unblock squad challenges and celebrate discoveries with the cohort.',
    forumChallenges: 'Weekly challenge',
    startNewTopic: 'Start new topic',
    searchForumPlaceholder: 'Search categories or discussions',
    latestTopic: 'Latest topic',
    topicsLabel: 'Topics',
    viewCategory: 'View category',
    forumEmptyState: 'No categories match your filters yet.',
    trendingTopics: 'Trending topics',
    replies: 'replies',
    views: 'views',
    forumTipsTitle: 'Posting tips',
    forumTipOne: 'Share context and resources to receive focused feedback.',
    forumTipTwo: 'Use tags to reach mentors who can best support you.',
    forumTipThree: 'Upvote helpful answers so the cohort can find them quickly.'
  },
  pt: {
    // Navigation  
    dashboard: 'Painel',
    learningPath: 'Trilha de Aprendizado',
    myTasks: 'Minhas Tarefas',
    activities: 'Atividades',
    forum: 'Fórum',
    calendar: 'Calendário',
    knowledgeBase: 'Base de Conhecimento',
    settings: 'Configurações',
    profile: 'Perfil',
    logout: 'Sair',
    navigation: 'Navegação',
    quickActions: 'Ações Rápidas',
    
    // Dashboard
    welcomeMessage: 'Pronto para Ascender, {name}?',
    welcomeSubtitle: 'Continue sua jornada cósmica de aprendizado e crescimento',
    cosmicPoints: 'Pontos Cósmicos',
    activeTasks: 'Tarefas Ativas', 
    coursesCompleted: 'Cursos Concluídos',
    learningStreak: 'Sequência de Aprendizado',
    wellbeingCheckin: 'Check-in de Bem-estar',
    howAreYouFeeling: 'Como você está se sentindo hoje?',
    availability: 'Disponibilidade',
    updateStatus: 'Atualizar Status',
    
    // Tasks
    newTask: 'Nova Tarefa',
    todo: 'A Fazer',
    inProgress: 'Em Andamento',
    inReview: 'Em Revisão', 
    done: 'Concluído',
    priority: 'Prioridade',
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa', 
    urgent: 'Urgente',
    dueDate: 'Data Limite',
    points: 'pontos',
    
    // Learning
    nextLessons: 'Próximas Lições',
    learningProgress: 'Progresso do Aprendizado',
    viewPath: 'Ver Trilha',
    minutes: 'minutos',
    basic: 'Básico',
    advanced: 'Avançado',

    // Activities
    mentorActivitiesTag: 'Atividades do padrinho',
    mentorJourneyTitle: 'Sua jornada guiada pelo padrinho',
    mentorJourneySubtitle: 'Acompanhe rituais, missões e reflexões enviadas pelo padrinho para manter a constelação alinhada.',
    activitiesSummaryOpen: 'Abertas',
    activitiesSummaryCompleted: 'Concluídas',
    activitiesSummaryNextDeadline: 'Próximo prazo',
    activitiesNoUpcomingDeadline: 'Sem prazos próximos',
    activitiesFilterLabel: 'Filtrar por status',
    activitiesFilterAll: 'Todas',
    activitiesFilterOpen: 'Abertas',
    activitiesFilterInProgress: 'Em andamento',
    activitiesFilterCompleted: 'Concluídas',
    activitiesStatusOpen: 'Aberta',
    activitiesStatusInProgress: 'Em andamento',
    activitiesStatusCompleted: 'Concluída',
    activitiesDueLabel: 'Prazo',
    activitiesMentorLabel: 'Mentor: {name}',
    activitiesInteractions: '{count} interações',
    activitiesResources: 'Recursos sugeridos',
    activitiesRespondCta: 'Responder atividade',
    activitiesMarkComplete: 'Marcar como concluída',
    activitiesMarkedComplete: 'Entrega registrada',
    activitiesEmptyTitle: 'Tudo pronto por aqui!',
    activitiesEmptyDescription: 'Seu padrinho ainda não enviou novas atividades. Aproveite para revisar suas conquistas.',
    activitiesDialogDetails: 'Prazo {deadline} · Mentor {mentor}',
    activitiesDialogResponseLabel: 'Sua resposta',
    activitiesDialogResponsePlaceholder: 'Compartilhe seus insights, anexos ou dúvidas...',
    activitiesDialogLinksLabel: 'Links úteis (opcional)',
    activitiesDialogLinksPlaceholder: 'Cole cada link em uma nova linha',
    activitiesDialogHistory: 'Histórico de interações',
    activitiesDialogEmptyHistory: 'Seja o primeiro a responder esta atividade.',
    activitiesDialogSubmitting: 'Enviando...',
    activitiesDialogSubmit: 'Enviar resposta',
    activitiesLoadError: 'Tivemos um problema ao carregar as atividades do padrinho.',
    activitiesRetry: 'Tentar novamente',
    activitiesSubmitError: 'Algo deu errado. Tente de novo.',
    activitiesInternFallback: 'Você',

    // Profile
    myBadges: 'Minhas Conquistas',
    avatarShop: 'Loja de Avatar',
    equip: 'Equipar',
    equipped: 'Equipado',
    
    // Feelings
    excellent: 'Excelente',
    good: 'Bem',
    neutral: 'Neutro',
    stressed: 'Estressado',
    overwhelmed: 'Sobrecarregado',
    
    // Status  
    available: 'Disponível',
    busy: 'Ocupado',
    inMeeting: 'Em Reunião',
    onBreak: 'Em Pausa',
    away: 'Ausente',
    
    // Common
    save: 'Salvar',
    cancel: 'Cancelar', 
    edit: 'Editar',
    delete: 'Excluir',
    loading: 'Carregando...',
    viewAll: 'Ver Todos',
    lightMode: 'Modo Claro',
    darkMode: 'Modo Escuro',
    highContrast: 'Alto Contraste',
    language: 'Idioma',
    previousMonth: 'Mês anterior',
    nextMonth: 'Próximo mês',
    goToToday: 'Hoje',
    requestVacation: 'Solicitar férias',
    newEvent: 'Novo evento',
    upcomingHighlights: 'Próximos destaques',
    vacationSummary: 'Resumo de férias',
    businessDays: 'Dias úteis: {count}',
    noVacationPlanned: 'Nenhuma férias planejada ainda',
    vacationDatesRequired: 'Selecione a data de início e término.',
    invalidDates: 'As datas selecionadas não são válidas.',
    vacationDateOrder: 'A data final deve ser depois da data inicial.',
    vacationDialogSubtitle: 'Compartilhe datas e contexto para seu padrinho apoiar seu descanso.',
    startDate: 'Data de início',
    endDate: 'Data de término',
    vacationReason: 'Motivo ou planos',
    vacationReasonPlaceholder: 'Conte ao padrinho como pretende recarregar as energias...',
    handoffNotes: 'Notas de handoff',
    handoffPlaceholder: 'Liste tarefas, arquivos ou contatos que precisam seguir em andamento.',
    submitRequest: 'Enviar solicitação',
    filterAll: 'Todos',
    filterTechnical: 'Técnico',
    filterCareer: 'Carreira',
    filterCommunity: 'Comunidade',
    filterCulture: 'Cultura',
    forumWelcome: 'Bem-vindo à órbita',
    forumTitle: 'Fórum Ascenda',
    forumSubtitle: 'Aprenda com mentores, destrave desafios do squad e celebre descobertas com a turma.',
    forumChallenges: 'Desafio da semana',
    startNewTopic: 'Criar novo tópico',
    searchForumPlaceholder: 'Busque por categorias ou discussões',
    latestTopic: 'Tópico mais recente',
    topicsLabel: 'Tópicos',
    viewCategory: 'Ver categoria',
    forumEmptyState: 'Nenhuma categoria corresponde aos filtros.',
    trendingTopics: 'Tópicos em destaque',
    replies: 'respostas',
    views: 'visualizações',
    forumTipsTitle: 'Dicas para postar',
    forumTipOne: 'Compartilhe contexto e links para receber feedback assertivo.',
    forumTipTwo: 'Use tags para alcançar os mentores mais alinhados.',
    forumTipThree: 'Marque as respostas úteis para a turma encontrar rápido.'
  }
};

const I18nContext = createContext();

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('ascenda-language') || 'en';
  });

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('ascenda-language', newLanguage);
  };

  const t = (key, variables = {}) => {
    const translation = translations[language]?.[key] || translations.en[key] || key;
    
    // Replace variables in translation
    return Object.keys(variables).reduce((str, variable) => {
      return str.replace(`{${variable}}`, variables[variable]);
    }, translation);
  };

  return (
    <I18nContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};