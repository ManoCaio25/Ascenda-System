import { createVacationRequest } from '../../services/vacationService.js';
import { toast, notifySound } from '../../services/notifyService.js';

export const createVacationSlice = (set, get) => ({
  submitVacation(payload) {
    const request = createVacationRequest(payload);
    set((state) => ({ vacationRequests: [...state.vacationRequests, request] }));
    toast('Solicitação enviada para aprovação.', 'success');
    notifySound();
    get().persist();
    return request;
  },
  getRequestsForSlug(slug) {
    return get().vacationRequests.filter((item) => item.slug === slug);
  },
  updateVacationStatus(id, status) {
    set((state) => {
      const requests = state.vacationRequests.map((request) =>
        request.id === id ? { ...request, status, updatedAt: new Date().toISOString() } : request
      );
      return { vacationRequests: requests };
    });
    toast('Solicitação atualizada.', 'info');
    get().persist();
  }
});