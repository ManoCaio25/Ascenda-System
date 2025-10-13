export function createQuizAssignment(quiz, slug, dueDate) {
  return {
    id: `${quiz.id}-${slug}-${Date.now()}`,
    quizId: quiz.id,
    slug,
    title: quiz.title,
    description: quiz.description,
    questions: quiz.questions,
    status: 'pending',
    responses: [],
    score: null,
    feedback: '',
    assignedAt: new Date().toISOString(),
    dueDate
  };
}

export function gradeQuiz(responses) {
  if (!responses || responses.length === 0) {
    return { score: 0, maxScore: 0 };
  }
  return responses.reduce(
    (acc, item) => {
      if (item.type === 'multiple') {
        acc.maxScore += item.weight ?? 1;
        if (item.selected === item.answer) {
          acc.score += item.weight ?? 1;
        }
      } else {
        acc.maxScore += item.weight ?? 2;
      }
      return acc;
    },
    { score: 0, maxScore: 0 }
  );
}