import { createQuizAssignment, gradeQuiz } from '../../services/quizService.js';
import { toast, notifySound } from '../../services/notifyService.js';

export const createQuizzesSlice = (set, get) => ({
  assignQuiz({ quizId, slugs, dueDate }) {
    const quiz = get().quizLibrary.find((item) => item.id === quizId);
    if (!quiz) {
      toast('Quiz não encontrado na biblioteca.', 'error');
      return;
    }
    const newAssignments = slugs.map((slug) => createQuizAssignment(quiz, slug, dueDate));
    set((state) => ({
      quizAssignments: [...state.quizAssignments, ...newAssignments]
    }));
    toast('Quiz atribuído com sucesso!', 'success');
    notifySound();
    get().persist();
    return newAssignments;
  },
  getAssignmentsForSlug(slug) {
    return get().quizAssignments.filter((item) => item.slug === slug);
  },
  submitQuiz({ assignmentId, responses, feedback }) {
    set((state) => {
      const assignments = state.quizAssignments.map((assignment) => {
        if (assignment.id !== assignmentId) return assignment;
        const result = gradeQuiz(responses);
        return {
          ...assignment,
          responses,
          feedback,
          status: 'submitted',
          score: result.score,
          maxScore: result.maxScore,
          submittedAt: new Date().toISOString()
        };
      });
      return { quizAssignments: assignments };
    });
    toast('Respostas salvas!', 'success');
    get().persist();
  }
});