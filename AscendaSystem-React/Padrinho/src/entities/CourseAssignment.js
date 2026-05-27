import { createEntityStore } from './store';
import { courseAssignments as initialAssignments } from './data';

const store = createEntityStore('ascenda_course_assignments', initialAssignments);

export const CourseAssignment = {
  list(sort, limit) {
    return store.list(sort, limit);
  },

  filter(criteria, sort, limit) {
    return store.filter(criteria, sort, limit);
  },

  find(id) {
    return store.findById(id);
  },

  async create(payload) {
    const now = new Date().toISOString();
    return store.create({
      status: 'assigned',
      progress: 0,
      assigned_date: now,
      ...payload,
    });
  },

  async update(id, updates) {
    const result = await store.update(id, {
      ...updates,
      completed_date:
        updates?.status === 'completed'
          ? new Date().toISOString()
          : updates?.completed_date,
      started_date:
        updates?.status === 'in_progress' && !updates?.started_date
          ? new Date().toISOString()
          : updates?.started_date,
    });
    return result;
  }
};

