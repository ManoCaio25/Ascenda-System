export function createVacationRequest({ slug, name, startDate, endDate, reason }) {
  return {
    id: `${slug}-vacation-${Date.now()}`,
    slug,
    name,
    startDate,
    endDate,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}