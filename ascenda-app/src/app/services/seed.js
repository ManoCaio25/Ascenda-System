export const schemaVersion = 1;

const padrinho = {
  id: 'padrinho-1',
  name: 'Paulo Henrique Viera',
  email: 'paulo.henrique@ascenda.com',
  password: '123456',
  role: 'padrinho',
  slug: 'paulo-henrique-viera'
};

const estagiarios = [
  {
    id: 'estagiario-1',
    name: 'Lucas Oliveira',
    email: 'lucas.oliveira@ascenda.com',
    password: '123456',
    role: 'estagiario',
    slug: 'lucas-oliveira',
    training: 'Python, IA, Machine Learning'
  },
  {
    id: 'estagiario-2',
    name: 'Gabriela Gomes',
    email: 'gabriela.gomes@ascenda.com',
    password: '123456',
    role: 'estagiario',
    slug: 'gabriela-gomes',
    training: 'Google, SAP, PMO, Gerência de Projetos'
  },
  {
    id: 'estagiario-3',
    name: 'Ana Carolina',
    email: 'ana.carolina@ascenda.com',
    password: '123456',
    role: 'estagiario',
    slug: 'ana-carolina',
    training: 'Gerência de Projetos, SAP, Lógica de Programação'
  },
  {
    id: 'estagiario-4',
    name: 'Iasmin Marozzi',
    email: 'iasmin.marozzi@ascenda.com',
    password: '123456',
    role: 'estagiario',
    slug: 'iasmin-marozzi',
    training: 'SAP HR, Google, ABAP, Fiori'
  },
  {
    id: 'estagiario-5',
    name: 'Leticia Alves',
    email: 'leticia.alves@ascenda.com',
    password: '123456',
    role: 'estagiario',
    slug: 'leticia-alves',
    training: 'Power BI, Dados'
  },
  {
    id: 'estagiario-6',
    name: 'Caio Menezes',
    email: 'caio.menezes@ascenda.com',
    password: '123456',
    role: 'estagiario',
    slug: 'caio-menezes',
    training: 'Biblioteca JS, React, Node, Angular'
  }
];

const quizLibrary = [
  {
    id: 'quiz-1',
    title: 'Fundamentos de Python',
    description: 'Conceitos básicos de Python e boas práticas.',
    dueInDays: 7,
    questions: [
      {
        id: 'q-1',
        type: 'multiple',
        prompt: 'Qual função imprime texto no Python?',
        options: ['print()', 'echo()', 'console.log()', 'output()'],
        answer: 0,
        weight: 2
      },
      {
        id: 'q-2',
        type: 'open',
        prompt: 'Descreva o que é uma list comprehension e cite um exemplo.',
        weight: 3
      }
    ]
  },
  {
    id: 'quiz-2',
    title: 'Machine Learning Essentials',
    description: 'Conceitos fundamentais de ML supervisionado.',
    dueInDays: 10,
    questions: [
      {
        id: 'q-3',
        type: 'multiple',
        prompt: 'Qual métrica é adequada para classificação desbalanceada?',
        options: ['Acurácia', 'Precisão', 'Recall', 'F1-Score'],
        answer: 3,
        weight: 2
      },
      {
        id: 'q-4',
        type: 'open',
        prompt: 'Explique o viés-variância em modelos de ML.',
        weight: 3
      }
    ]
  },
  {
    id: 'quiz-3',
    title: 'Power BI Avançado',
    description: 'Criação de dashboards com DAX.',
    dueInDays: 6,
    questions: [
      {
        id: 'q-5',
        type: 'multiple',
        prompt: 'Qual função DAX calcula acumulado?',
        options: ['SUMX', 'CALCULATE', 'TOTALYTD', 'FILTER'],
        answer: 2,
        weight: 2
      },
      {
        id: 'q-6',
        type: 'open',
        prompt: 'Como otimizar um relatório grande no Power BI?',
        weight: 3
      }
    ]
  },
  {
    id: 'quiz-4',
    title: 'Gerência de Projetos',
    description: 'Processos do PMBOK e abordagens ágeis.',
    dueInDays: 8,
    questions: [
      {
        id: 'q-7',
        type: 'multiple',
        prompt: 'Qual área do PMBOK trata da comunicação?',
        options: ['Escopo', 'Integração', 'Comunicações', 'Riscos'],
        answer: 2,
        weight: 2
      },
      {
        id: 'q-8',
        type: 'open',
        prompt: 'Quando priorizar Scrum ao invés de PMBOK?',
        weight: 3
      }
    ]
  },
  {
    id: 'quiz-5',
    title: 'SAP Fundamentos',
    description: 'Fluxos básicos em módulos SAP.',
    dueInDays: 7,
    questions: [
      {
        id: 'q-9',
        type: 'multiple',
        prompt: 'O que é o módulo SAP FI?',
        options: ['Financeiro', 'Recursos Humanos', 'Produção', 'Vendas'],
        answer: 0,
        weight: 2
      },
      {
        id: 'q-10',
        type: 'open',
        prompt: 'Cite uma integração entre FI e outro módulo.',
        weight: 3
      }
    ]
  },
  {
    id: 'quiz-6',
    title: 'React Essencial',
    description: 'Hooks, estado e componentes reutilizáveis.',
    dueInDays: 5,
    questions: [
      {
        id: 'q-11',
        type: 'multiple',
        prompt: 'Qual hook substitui componentDidMount?',
        options: ['useState', 'useEffect', 'useMemo', 'useCallback'],
        answer: 1,
        weight: 2
      },
      {
        id: 'q-12',
        type: 'open',
        prompt: 'Explique memoização em componentes React.',
        weight: 3
      }
    ]
  },
  {
    id: 'quiz-7',
    title: 'Análise de Dados',
    description: 'Estatística descritiva para negócios.',
    dueInDays: 9,
    questions: [
      {
        id: 'q-13',
        type: 'multiple',
        prompt: 'Qual medida é resistente a outliers?',
        options: ['Média', 'Mediana', 'Desvio padrão', 'Moda'],
        answer: 1,
        weight: 2
      },
      {
        id: 'q-14',
        type: 'open',
        prompt: 'Como explicar boxplots para gestores?',
        weight: 3
      }
    ]
  },
  {
    id: 'quiz-8',
    title: 'Cultura Ascenda',
    description: 'Valores, rituais e expectativas da empresa.',
    dueInDays: 4,
    questions: [
      {
        id: 'q-15',
        type: 'multiple',
        prompt: 'Qual valor prioriza experimentação?',
        options: ['Foco', 'Transparência', 'Inovação', 'Sustentabilidade'],
        answer: 2,
        weight: 2
      },
      {
        id: 'q-16',
        type: 'open',
        prompt: 'Descreva como aplicar a cultura em um projeto novo.',
        weight: 3
      }
    ]
  },
  {
    id: 'quiz-9',
    title: 'Comunicação e Feedback',
    description: 'Estratégias para feedback construtivo.',
    dueInDays: 6,
    questions: [
      {
        id: 'q-17',
        type: 'multiple',
        prompt: 'Qual técnica reforça feedbacks positivos?',
        options: ['Sanduíche', 'GUT', 'SMART', 'OKR'],
        answer: 0,
        weight: 2
      },
      {
        id: 'q-18',
        type: 'open',
        prompt: 'Como lidar com feedback difícil em público?',
        weight: 3
      }
    ]
  }
];

const activities = estagiarios.flatMap((user) =>
  Array.from({ length: 7 }).map((_, index) => ({
    id: `${user.slug}-activity-${index + 1}`,
    slug: user.slug,
    title: `Atividade ${index + 1}`,
    description: `Entrega prática focada no desenvolvimento de ${user.training.split(',')[0]}.`,
    status: index % 3 === 0 ? 'done' : index % 3 === 1 ? 'in-progress' : 'pending',
    dueDate: new Date().toISOString()
  }))
);

const videos = estagiarios.flatMap((user) =>
  Array.from({ length: 8 }).map((_, index) => ({
    id: `${user.slug}-video-${index + 1}`,
    slug: user.slug,
    title: `Video ${index + 1} - ${user.name}`,
    url: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4',
    thumbnail: `https://picsum.photos/seed/${user.slug}-${index}/320/180`,
    duration: 600
  }))
);

const forumTopics = [
  {
    id: 'topic-1',
    title: 'Dicas para conciliar estudos e trabalho',
    slug: 'lucas-oliveira',
    createdAt: new Date().toISOString(),
    body: 'Como vocês se organizam para estudar novas tecnologias durante a semana?',
    comments: [
      {
        id: 'comment-1',
        author: 'gabriela-gomes',
        message: 'Uso o Notion para planejar e separar blocos de 45 minutos.',
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'topic-2',
    title: 'Materiais sobre SAP HR',
    slug: 'iasmin-marozzi',
    createdAt: new Date().toISOString(),
    body: 'Quais conteúdos recomendam para quem está começando com SAP HR?',
    comments: [
      {
        id: 'comment-2',
        author: 'paulo-henrique-viera',
        message: 'Temos uma trilha interna com foco em processos de RH, posso compartilhar.',
        createdAt: new Date().toISOString()
      }
    ]
  },
  {
    id: 'topic-3',
    title: 'Compartilhe vitórias da semana',
    slug: 'leticia-alves',
    createdAt: new Date().toISOString(),
    body: 'Vamos celebrar as pequenas vitórias! O que você aprendeu que mais orgulha?',
    comments: [
      {
        id: 'comment-3',
        author: 'caio-menezes',
        message: 'Implementei um hook customizado para debounce que economizou várias linhas!',
        createdAt: new Date().toISOString()
      }
    ]
  }
];

export function buildSeed() {
  return {
    users: [padrinho, ...estagiarios],
    quizLibrary,
    quizAssignments: [],
    activities,
    videos,
    videoProgress: [],
    vacationRequests: [],
    forumTopics,
    notifications: [],
    session: null
  };
}
