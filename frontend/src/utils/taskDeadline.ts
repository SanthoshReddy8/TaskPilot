import type { Task } from "../types/task";

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isOverdue(task: Task, now = new Date()): boolean {
  if (!task.dueDate || task.status === "COMPLETED") {
    return false;
  }
  return task.dueDate.slice(0, 10) < localDateKey(now);
}

export function isUpcoming(task: Task, now = new Date()): boolean {
  if (!task.dueDate || task.status === "COMPLETED") {
    return false;
  }

  const start = localDateKey(now);
  const end = localDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7));
  const dueDate = task.dueDate.slice(0, 10);
  return dueDate >= start && dueDate <= end;
}

export function sortByDeadline(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const dateA = a.dueDate?.slice(0, 10);
    const dateB = b.dueDate?.slice(0, 10);

    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateA.localeCompare(dateB);
  });
}

export function formatDueDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}