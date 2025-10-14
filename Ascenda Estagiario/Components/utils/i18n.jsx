import { useState, useEffect, createContext, useContext } from 'react';

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    learningPath: 'Learning Path', 
    myTasks: 'My Tasks',
    forum: 'Forum',
    calendar: 'Calendar',
    knowledgeBase: 'Knowledge Base',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
    
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
    language: 'Language'
  },
  pt: {
    // Navigation  
    dashboard: 'Painel',
    learningPath: 'Trilha de Aprendizado',
    myTasks: 'Minhas Tarefas',
    forum: 'Fórum',
    calendar: 'Calendário', 
    knowledgeBase: 'Base de Conhecimento',
    settings: 'Configurações',
    profile: 'Perfil',
    logout: 'Sair',
    
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
    language: 'Idioma'
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