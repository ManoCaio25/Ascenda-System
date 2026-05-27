export async function fakeAscendaIAActivities({ focus, goal, youtubeUrl, fileName }) {
  await new Promise((resolve) => setTimeout(resolve, 2200));

  const sanitizedFocus =
    focus?.trim() ||
    (youtubeUrl ? "vídeo do YouTube" : fileName ? fileName.replace(/\.[^/.]+$/, "") : "conteúdo");

  const defaultGoal = goal?.trim() || `Conectar o aprendizado ao ${sanitizedFocus}`;
  const sourceLabel = youtubeUrl ? "vídeo" : fileName ? "documento" : "conteúdo";

  const activities = [
    {
      id: 1,
      title: `Quebra-gelo contextual sobre ${sanitizedFocus}`,
      type: "Dinâmica inicial",
      duration: "10 minutos",
      instructions:
        "Promova uma conversa rápida pedindo que cada participante compartilhe o que já sabe ou espera aprender sobre o tema.",
    },
    {
      id: 2,
      title: `Exploração guiada do ${sourceLabel}`,
      type: "Atividade em grupo",
      duration: "20 minutos",
      instructions: "Divida os participantes em duplas ou trios e peça que identifiquem três ideias-chave do material analisado.",
    },
    {
      id: 3,
      title: `Aplicação prática do conteúdo`,
      type: "Mão na massa",
      duration: "25 minutos",
      instructions:
        "Proponha uma tarefa em que os participantes apliquem o conteúdo em um caso real ou simulado, apresentando o resultado ao final.",
    },
    {
      id: 4,
      title: `Reflexão final e próximos passos`,
      type: "Debate orientado",
      duration: "15 minutos",
      instructions: "Conduza uma rodada final perguntando como o aprendizado pode ser aplicado no dia a dia e quais dúvidas ainda permanecem.",
    },
  ];

  return {
    id: `activity_${Date.now()}`,
    focus: sanitizedFocus,
    goal: defaultGoal,
    generatedAt: new Date().toISOString(),
    source: {
      youtubeUrl: youtubeUrl?.trim() || null,
      fileName: fileName || null,
    },
    items: activities,
    status: "draft",
  };
}
