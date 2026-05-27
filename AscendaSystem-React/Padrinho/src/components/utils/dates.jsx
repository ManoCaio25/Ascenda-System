import { differenceInDays, addYears, format } from "date-fns";

export function addYearsISO(isoDate, years = 1) {
  const date = new Date(isoDate);
  return addYears(date, years).toISOString();
}

export function getDaysLeft(endDateISO) {
  const today = new Date();
  const endDate = new Date(endDateISO);
  return differenceInDays(endDate, today);
}

export function getDaysLeftBadgeColor(daysLeft) {
  if (daysLeft > 60) return { bg: 'bg-success/20', text: 'text-success', border: 'border-success/30' };
  if (daysLeft > 30) return { bg: 'bg-warning/20', text: 'text-warning', border: 'border-warning/30' };
  return { bg: 'bg-error/20', text: 'text-error', border: 'border-error/30' };
}

export function getInternshipProgress(startDateISO, endDateISO) {
  const start = new Date(startDateISO);
  const end = new Date(endDateISO);
  const today = new Date();
  
  const totalDays = differenceInDays(end, start);
  const elapsedDays = differenceInDays(today, start);
  
  return Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));
}