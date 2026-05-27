import aiKnowledgeBase, {
  fallbackResponses,
  followUpLabel,
  defaultSuggestions,
} from '@estagiario/data/aiKnowledgeBase';

const normalizeText = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractQuestionFromPrompt = (prompt = '') => {
  const match = prompt.match(/user question:\s*["'`]?([^"'`]+)["'`]?/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return prompt.trim();
};

const resolveLanguage = (language) => {
  if (!language) return 'pt';
  return language.toLowerCase().startsWith('en') ? 'en' : 'pt';
};

const computeScore = (entry, normalizedMessage) => {
  if (!entry?.keywords || !normalizedMessage) {
    return 0;
  }

  let score = 0;
  let matches = 0;

  entry.keywords.forEach((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedKeyword && normalizedMessage.includes(normalizedKeyword)) {
      matches += 1;
      score += 2;
    }
  });

  if (matches === 0) {
    return 0;
  }

  return score + (entry.priority || 0);
};

const formatFollowUps = (entry, language) => {
  const followUps = entry.followUps?.[language];
  if (!followUps || followUps.length === 0) {
    return '';
  }

  const label = entry.followUpLabel?.[language] || followUpLabel[language];
  const formattedList = followUps.map((item) => `- ${item}`).join('\n');
  return `\n\n${label}\n${formattedList}`;
};

const formatFallback = (language) => {
  const intro = fallbackResponses.noMatch[language] || fallbackResponses.noMatch.en;
  const suggestions = defaultSuggestions[language] || defaultSuggestions.en;
  const formattedSuggestions = suggestions.map((item) => `- ${item}`).join('\n');
  const label = followUpLabel[language] || followUpLabel.en;
  return `${intro}\n\n${label}\n${formattedSuggestions}`;
};

export async function InvokeLLM({ message, prompt, language }) {
  const selectedLanguage = resolveLanguage(language);
  const question = message?.trim() || extractQuestionFromPrompt(prompt);

  if (!question) {
    return fallbackResponses.emptyQuestion[selectedLanguage] || fallbackResponses.emptyQuestion.en;
  }

  const normalizedMessage = normalizeText(question);

  let bestMatch = null;
  let bestScore = 0;

  aiKnowledgeBase.forEach((entry) => {
    const score = computeScore(entry, normalizedMessage);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  });

  if (bestMatch) {
    const answer = bestMatch.answer?.[selectedLanguage] || bestMatch.answer?.en || '';
    return `${answer}${formatFollowUps(bestMatch, selectedLanguage)}`.trim();
  }

  return formatFallback(selectedLanguage);
}
