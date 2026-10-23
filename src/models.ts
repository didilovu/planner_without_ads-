export type Day = string;
export type Section = "today" | "tomorrow" | "week";
export interface Task {
  id: string;
  title: string;
  priority: 1 | 2 | 3;
  due: Day;
  kind: "day" | "week";
  createdAt: string;
  completedAt: string | null;
}
export type Schedule =
  | { type: "daily" }
  | { type: "weekdays"; days: number[] }
  | { type: "interval"; every: number; anchor: Day };
export interface Habit {
  id: string;
  title: string;
  icon: string;
  color: string;
  schedule: Schedule;
  createdOn: Day;
  order: number;
  history: Day[];
}
export interface Data {
  version: 1;
  tasks: Task[];
  habits: Habit[];
}
export const emptyData = (): Data => ({ version: 1, tasks: [], habits: [] });
