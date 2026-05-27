const followUpLabel = {
  en: 'You can also ask about:',
  pt: 'Você também pode perguntar sobre:'
};

const defaultSuggestions = {
  en: [
    'How does the task board work?',
    'What can I track on the learning path?',
    'How do points and badges help me grow?'
  ],
  pt: [
    'Como funciona o quadro de tarefas?',
    'O que acompanho na trilha de aprendizado?',
    'Como os pontos e badges impulsionam meu crescimento?'
  ]
};

const aiKnowledgeBase = [
  {
    id: 'greeting',
    keywords: ['oi', 'olá', 'ola', 'hello', 'hi', 'hey', 'bom dia', 'boa tarde', 'boa noite'],
    priority: 4,
    answer: {
      pt: 'Olá, tripulante! ✨ Estou pronto para guiar sua jornada pela Ascenda. O que você quer descobrir?',
      en: 'Hello, explorer! ✨ I am ready to guide you through Ascenda. What would you like to discover?'
    },
    followUps: {
      pt: ['Detalhes do painel principal', 'Trilha de aprendizado', 'Gamificação e conquistas'],
      en: ['Dashboard overview', 'Learning path', 'Gamification and achievements']
    }
  },
  {
    id: 'farewell',
    keywords: ['tchau', 'até logo', 'ate logo', 'see you', 'bye', 'adeus', 'valeu'],
    priority: 3,
    answer: {
      pt: 'Até breve! 🌠 Quando quiser, é só chamar que retomo sua jornada cósmica.',
      en: 'See you soon! 🌠 Call me anytime you want to continue your cosmic journey.'
    }
  },
  {
    id: 'thanks',
    keywords: ['obrigado', 'obrigada', 'thank you', 'thanks', 'valeu', 'agradeço', 'grato'],
    priority: 3,
    answer: {
      pt: 'Eu que agradeço! 🚀 Se surgir outra dúvida sobre a Ascenda, estou por aqui.',
      en: 'Happy to help! 🚀 If another Ascenda question pops up, I am right here.'
    }
  },
  {
    id: 'platform-overview',
    keywords: ['ascenda', 'plataforma', 'portal', 'sistema', 'funcionalidades', 'recursos', 'features', 'internship'],
    priority: 8,
    answer: {
      pt: 'A Ascenda é um portal cósmico de estágio onde você acompanha tarefas, trilhas de aprendizado, calendário, fórum, atividades do padrinho e estatísticas de evolução. Tudo foi pensado para apoiar seu desenvolvimento com contexto, mentoria e gamificação.',
      en: 'Ascenda is a cosmic internship portal where you track tasks, learning paths, calendar events, forum discussions, mentor activities, and growth stats. Every area is designed to support your development with context, mentoring, and gamified motivation.'
    },
    followUps: {
      pt: ['Quais seções existem no painel?', 'Como funciona o quadro Kanban?', 'Onde vejo minhas conquistas?'],
      en: ['What sections exist on the dashboard?', 'How does the Kanban board work?', 'Where can I see my achievements?']
    }
  },
  {
    id: 'dashboard',
    keywords: ['dashboard', 'painel', 'overview', 'resumo', 'cards'],
    priority: 6,
    answer: {
      pt: 'O painel reúne seu status geral: pontos cósmicos, tarefas ativas, cursos concluídos, streak de aprendizado e widgets de bem-estar. Ele traz atalhos para atualizar disponibilidade, acompanhar missões e retomar conteúdos rapidamente.',
      en: 'The dashboard gathers your overall status: cosmic points, active tasks, completed courses, learning streak, and well-being widgets. It also surfaces quick actions to update availability, review missions, and resume learning content fast.'
    },
    followUps: {
      pt: ['Como funciona o check-in de bem-estar?', 'Onde atualizo minha disponibilidade?', 'O que aparece nos atalhos rápidos?'],
      en: ['How does the well-being check-in work?', 'Where do I update my availability?', 'What shows up in quick actions?']
    }
  },
  {
    id: 'tasks-board',
    keywords: ['tarefas', 'tasks', 'kanban', 'quadro', 'board', 'colunas'],
    priority: 7,
    answer: {
      pt: 'O quadro de tarefas segue o fluxo Kanban com colunas A Fazer, Em Andamento, Em Revisão e Concluído. Cada card mostra prioridade, prazo, pontos e links de apoio. Você pode mover tarefas entre colunas para sinalizar progresso e registrar entregas.',
      en: 'The task board follows a Kanban flow with To Do, In Progress, In Review, and Done columns. Each card highlights priority, due date, points, and helpful links. Drag tasks across columns to signal progress and register completions.'
    },
    followUps: {
      pt: ['Posso ver detalhes de uma tarefa?', 'Como atualizar o status rapidamente?', 'Onde vejo a prioridade?'],
      en: ['Can I open task details?', 'How do I update status quickly?', 'Where do I see priority?']
    }
  },
  {
    id: 'learning-path',
    keywords: ['trilha', 'aprendizado', 'learning path', 'cursos', 'conteúdos', 'conteudos'],
    priority: 7,
    answer: {
      pt: 'Na Trilha de Aprendizado você vê módulos por nível, vídeos, artigos e atividades práticas. O progresso fica salvo automaticamente, então você pode retomar do minuto exato e destravar novos conteúdos conforme conclui etapas.',
      en: 'Within the Learning Path you find level-based modules with videos, articles, and hands-on activities. Progress saves automatically, letting you resume at the exact minute and unlock new content as you complete previous steps.'
    },
    followUps: {
      pt: ['Como sei se um conteúdo está liberado?', 'Existe indicação de tempo restante?', 'Onde vejo meu progresso geral?'],
      en: ['How do I know if content is unlocked?', 'Is there an estimate of remaining time?', 'Where do I see my overall progress?']
    }
  },
  {
    id: 'mentor-activities',
    keywords: ['padrinho', 'mentor', 'atividades', 'missões', 'rituais', 'missions'],
    priority: 6,
    answer: {
      pt: 'As atividades do padrinho concentram missões guiadas, rituais e checkpoints de acompanhamento. Você responde com comentários, anexos e links, além de acompanhar o histórico de interações para manter a constelação alinhada com o mentor.',
      en: 'Mentor activities gather guided missions, rituals, and follow-up checkpoints. You can answer with comments, attachments, and links while tracking the interaction history to keep your constellation aligned with the mentor.'
    },
    followUps: {
      pt: ['Como marco uma atividade como concluída?', 'Consigo ver recursos sugeridos?', 'Onde ficam os prazos?'],
      en: ['How do I mark an activity complete?', 'Can I see suggested resources?', 'Where are the due dates?']
    }
  },
  {
    id: 'gamification',
    keywords: ['pontos', 'badges', 'conquistas', 'gamificação', 'gamificacao', 'loja', 'shop', 'avatar'],
    priority: 6,
    answer: {
      pt: 'A gamificação conecta seus avanços a pontos cósmicos, badges temáticos e itens de avatar. Ganhe pontos ao concluir tarefas, cursos e missões; depois use a loja para equipar visuais ou destacar conquistas no perfil.',
      en: 'Gamification links your progress to cosmic points, themed badges, and avatar cosmetics. Earn points by completing tasks, courses, and mentor missions; then visit the shop to equip visuals or highlight achievements on your profile.'
    },
    followUps: {
      pt: ['Onde vejo meus pontos atuais?', 'Como desbloqueio novos itens?', 'O que significa a raridade dos badges?'],
      en: ['Where do I see my current points?', 'How do I unlock new items?', 'What does badge rarity mean?']
    }
  },
  {
    id: 'forum',
    keywords: ['fórum', 'forum', 'discussões', 'discussoes', 'comunidade', 'ajuda coletiva'],
    priority: 5,
    answer: {
      pt: 'O fórum é a órbita coletiva para compartilhar dúvidas, descobertas e feedback com outros estagiários e mentores. Você pode filtrar por categorias, acompanhar tópicos em alta e publicar suas próprias discussões com tags específicas.',
      en: 'The forum is the collective orbit to share questions, discoveries, and feedback with fellow interns and mentors. Filter by category, follow trending topics, and publish your own discussions with dedicated tags.'
    },
    followUps: {
      pt: ['Como crio um novo tópico?', 'Posso buscar por tags?', 'Existe um destaque de respostas?'],
      en: ['How do I create a new topic?', 'Can I search by tags?', 'Is there a highlight for best answers?']
    }
  },
  {
    id: 'calendar',
    keywords: ['calendário', 'calendario', 'agenda', 'eventos', 'ferias', 'férias', 'vacation'],
    priority: 5,
    answer: {
      pt: 'O calendário mostra eventos, prazos e férias planejadas. Você pode navegar por mês, voltar ao dia atual, solicitar férias informando datas, motivos e notas de handoff para manter o time alinhado.',
      en: 'The calendar displays events, deadlines, and planned vacations. Navigate by month, jump back to today, and request time off by sharing dates, context, and handoff notes so the team stays aligned.'
    },
    followUps: {
      pt: ['Como adiciono um novo evento?', 'Consigo ver destaques da semana?', 'Onde faço a solicitação de férias?'],
      en: ['How do I add a new event?', 'Can I see upcoming highlights?', 'Where do I request vacation?']
    }
  },
  {
    id: 'profile',
    keywords: ['perfil', 'profile', 'avatar', 'personalização', 'personalizacao', 'dados pessoais'],
    priority: 4,
    answer: {
      pt: 'No perfil você atualiza informações pessoais, acompanha estatísticas e equipa badges ou itens de avatar. É o espaço para mostrar sua identidade cósmica e acompanhar conquistas como pontos, missões ativas e sincronizações com o mentor.',
      en: 'In the profile you update personal information, track stats, and equip badges or avatar items. It is the place to show your cosmic identity and monitor achievements like points, active missions, and mentor syncs.'
    },
    followUps: {
      pt: ['Como troco minha foto de perfil?', 'Onde vejo minhas estatísticas?', 'Posso equipar mais de um item?'],
      en: ['How do I change my profile photo?', 'Where can I see my stats?', 'Can I equip more than one item?']
    }
  },
  {
    id: 'wellbeing',
    keywords: ['bem-estar', 'bem estar', 'wellbeing', 'humor', 'sentindo', 'check-in'],
    priority: 4,
    answer: {
      pt: 'O check-in de bem-estar permite registrar como você está se sentindo no dia. Isso ajuda seu padrinho a acompanhar seu clima, equilibrar demandas e sugerir momentos de pausa quando necessário.',
      en: 'The well-being check-in lets you record how you are feeling today. It helps your mentor follow your mood, balance demands, and suggest breaks whenever needed.'
    },
    followUps: {
      pt: ['Meus registros ficam visíveis ao padrinho?', 'Posso atualizar mais de uma vez ao dia?', 'Isso impacta minhas atividades?'],
      en: ['Can my mentor see the entries?', 'Can I update it more than once a day?', 'Does it impact my activities?']
    }
  },
  {
    id: 'availability',
    keywords: ['disponibilidade', 'availability', 'status', 'presenca', 'presença', 'online'],
    priority: 4,
    answer: {
      pt: 'Você pode atualizar seu status de disponibilidade direto no painel, escolhendo opções como Disponível, Em Reunião ou Pausa. Isso sinaliza ao time como entrar em contato e ajuda a planejar sincronizações.',
      en: 'You can update your availability status right from the dashboard, choosing options like Available, In Meeting, or On Break. It signals to the team how to reach you and helps plan syncs.'
    },
    followUps: {
      pt: ['Onde vejo o status atual?', 'Consigo agendar mudanças futuras?', 'O status aparece para meus colegas?'],
      en: ['Where do I see my current status?', 'Can I schedule future changes?', 'Do teammates see the status?']
    }
  },
  {
    id: 'knowledge-base',
    keywords: ['base de conhecimento', 'knowledge base', 'documentação', 'documentacao', 'wiki'],
    priority: 3,
    answer: {
      pt: 'A base de conhecimento reúne guias, FAQs e boas práticas para acelerar seu aprendizado. Ela é integrada às trilhas e às atividades, então você sempre encontra referências confiáveis quando abrir uma tarefa.',
      en: 'The knowledge base collects guides, FAQs, and best practices to accelerate your learning. It is integrated with learning paths and activities so you always find trusted references when opening a task.'
    },
    followUps: {
      pt: ['Como pesquiso dentro da base?', 'Existem materiais recomendados pelo padrinho?', 'Posso salvar favoritos?'],
      en: ['How do I search inside the base?', 'Are there mentor-recommended materials?', 'Can I save favorites?']
    }
  },
  {
    id: 'support',
    keywords: ['ajuda', 'help', 'suporte', 'support', 'preciso de ajuda'],
    priority: 5,
    answer: {
      pt: 'Conte comigo para navegar pelos recursos da Ascenda! Se precisar de suporte humano, sinalize no fórum, procure seu padrinho ou acione o time interno pelo canal oficial da empresa.',
      en: 'Count on me to navigate Ascenda resources! If you need human support, post in the forum, reach your mentor, or contact the internal team via the company’s official channel.'
    },
    followUps: {
      pt: ['Onde encontro o fórum?', 'Quem é meu padrinho?', 'Existe um canal de suporte interno?'],
      en: ['Where do I find the forum?', 'Who is my mentor?', 'Is there an internal support channel?']
    }
  }
];

const fallbackResponses = {
  emptyQuestion: {
    pt: 'Envie uma pergunta sobre a Ascenda e eu preparo a resposta com brilho cósmico. 🌌',
    en: 'Send me a question about Ascenda and I will craft a response filled with cosmic sparkles. 🌌'
  },
  noMatch: {
    pt: 'Ainda estou treinando minhas constelações neurais para esse assunto. Tente reformular ou explorar um dos temas abaixo.',
    en: 'I am still training my neural constellations for that topic. Try rephrasing or explore one of the topics below.'
  }
};

export { aiKnowledgeBase, fallbackResponses, followUpLabel, defaultSuggestions };

export default aiKnowledgeBase;
