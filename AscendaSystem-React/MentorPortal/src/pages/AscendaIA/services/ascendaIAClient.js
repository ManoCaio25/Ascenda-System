const ACCENT_MAP = {
  easy: "sky",
  intermediate: "violet",
  advanced: "fuchsia",
};

function buildQuestion(level, index, topic, source) {
  const prompts = {
    easy: `Quick check ${index + 1} about ${topic}.`,
    intermediate: `Scenario ${index + 1}: apply the knowledge on ${topic}.`,
    advanced: `Challenge ${index + 1} exploring advanced insights on ${topic}.`,
  };

  const options = [
    "Option A",
    "Option B",
    "Option C",
    "Option D",
  ];

  return {
    id: `${level}-${Date.now()}-${index}`,
    level,
    prompt: prompts[level] ?? prompts.easy,
    options,
    correctIndex: Math.floor(Math.random() * options.length),
    source,
  };
}

async function fakeAscendaIAByLevels(request) {
  const { topic, youtubeUrl, textContent, counts } = request;
  const sourceLabel = youtubeUrl || (textContent ? "text document" : topic);

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await wait(1200 + Math.random() * 600);

  const buildList = (level) => {
    const count = Math.max(0, Number(counts?.[level] ?? 0));
    return Array.from({ length: count }, (_, index) =>
      buildQuestion(level, index, topic, sourceLabel),
    );
  };

  const now = new Date();

  return {
    topic,
    source: sourceLabel,
    createdBy: "AscendaIA 🤖",
    createdAt: now.toISOString(),
    easy: buildList("easy"),
    intermediate: buildList("intermediate"),
    advanced: buildList("advanced"),
  };
}

export const ascendaIAClient = {
  async generateQuizzes(request) {
    return fakeAscendaIAByLevels(request);
  },
};

export { ACCENT_MAP };
