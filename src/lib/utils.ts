import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns a human-readable string for time left until dueDate.
 * @param dueDate Date or string (ISO) representing the deadline
 * @returns e.g. '2 days left', 'Due today', 'Overdue by 1 day'
 */
export function getTimeLeft(dueDate: Date | string): string {
  const now = new Date();
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  // Zero out time for date-only comparison
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.ceil((due.getTime() - now.getTime()) / msPerDay);
  if (diff > 1) return `${diff} days left`;
  if (diff === 1) return 'Due tomorrow';
  if (diff === 0) return 'Due today';
  if (diff === -1) return 'Overdue by 1 day';
  return `Overdue by ${Math.abs(diff)} days`;
}
