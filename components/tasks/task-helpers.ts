import {
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
  isPast,
  format,
  getWeek,
  parseISO,
} from "date-fns";
import type { TaskDetail, DayColumn, WeekData } from "@/types/task";

/**
 * Generate week data for the board view
 */
export function generateWeekData(
  baseDate: Date,
  tasks: TaskDetail[],
  showWeekends: boolean = true
): WeekData {
  const start = startOfWeek(baseDate, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(baseDate, { weekStartsOn: 1 }); // Sunday
  const weekNumber = getWeek(baseDate, { weekStartsOn: 1 });

  const days: DayColumn[] = [];
  const dayCount = showWeekends ? 7 : 5;

  for (let i = 0; i < dayCount; i++) {
    const date = addDays(start, i);
    const dayTasks = tasks.filter((task) => {
      if (!task.endDate) return false;
      const taskDate = new Date(task.endDate);
      return isSameDay(taskDate, date);
    });

    days.push({
      date,
      dayName: format(date, "EEE"),
      dayNumber: parseInt(format(date, "d"), 10),
      isToday: isToday(date),
      isPast: isPast(date) && !isToday(date),
      tasks: dayTasks.sort((a, b) => a.order - b.order),
    });
  }

  return {
    startDate: start,
    endDate: showWeekends ? end : addDays(start, 4),
    days,
    weekNumber,
  };
}

/**
 * Navigate to previous week
 */
export function getPreviousWeek(currentDate: Date): Date {
  return subWeeks(currentDate, 1);
}

/**
 * Navigate to next week
 */
export function getNextWeek(currentDate: Date): Date {
  return addWeeks(currentDate, 1);
}

/**
 * Get tasks without a due date
 */
export function getUnscheduledTasks(tasks: TaskDetail[]): TaskDetail[] {
  return tasks.filter((task) => !task.endDate);
}

/**
 * Get overdue tasks
 */
export function getOverdueTasks(tasks: TaskDetail[]): TaskDetail[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.filter((task) => {
    if (!task.endDate || task.status === "DONE") return false;
    const dueDate = new Date(task.endDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });
}

/**
 * Format date for display
 */
export function formatTaskDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d");
}

/**
 * Format date for API
 */
export function formatDateForApi(date: Date): string {
  return date.toISOString();
}

/**
 * Check if date is in the current week
 */
export function isCurrentWeek(date: Date): boolean {
  const today = new Date();
  const start = startOfWeek(today, { weekStartsOn: 1 });
  const end = endOfWeek(today, { weekStartsOn: 1 });
  return date >= start && date <= end;
}

/**
 * Get the start of a day (midnight)
 */
export function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get completion percentage
 */
export function getCompletionPercentage(total: number, completed: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}
