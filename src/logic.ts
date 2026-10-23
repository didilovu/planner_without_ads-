import {
  addDays,
  differenceInCalendarDays,
  endOfWeek,
  format,
  isValid,
  parseISO,
} from "date-fns";
import type { Data, Habit, Section, Task } from "./models";
export const dayKey = (date = new Date()) => format(date, "yyyy-MM-dd");
export const validDay = (v: unknown): v is string =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  isValid(parseISO(v)) &&
  dayKey(parseISO(v)) === v;
export function scheduled(h: Habit, day: string) {
  if (day < h.createdOn) return false;
  const s = h.schedule;
  if (s.type === "daily") return true;
  if (s.type === "weekdays") return s.days.includes(parseISO(day).getDay());
  const n = differenceInCalendarDays(parseISO(day), parseISO(s.anchor));
  return n >= 0 && n % s.every === 0;
}
export function sectionFor(t: Task, today: string): Section {
  if (t.due <= today) return "today";
  if (t.kind === "week") return "week";
  return t.due === dayKey(addDays(parseISO(today), 1)) ? "tomorrow" : "week";
}
export const dueFor = (section: Section, today: string) =>
  section === "today"
    ? today
    : section === "tomorrow"
      ? dayKey(addDays(parseISO(today), 1))
      : dayKey(endOfWeek(parseISO(today), { weekStartsOn: 1 }));
export function orderedHabits(habits: Habit[], today: string) {
  return [...habits].sort(
    (a, b) =>
      Number(a.history.includes(today)) - Number(b.history.includes(today)) ||
      a.order - b.order,
  );
}
export function toggleHistory(h: Habit, day: string): Habit {
  return {
    ...h,
    history: h.history.includes(day)
      ? h.history.filter((d) => d !== day)
      : [...h.history, day],
  };
}
export function validateData(value: unknown): Data {
  const fail = (): never => {
    throw new Error(
      "Файл не соответствует формату резервной копии Little Turtle Planner.",
    );
  };
  if (!value || typeof value !== "object") return fail();
  const d = value as Data;
  if (d.version !== 1 || !Array.isArray(d.tasks) || !Array.isArray(d.habits))
    return fail();
  const ids = new Set<string>();
  const str = (v: unknown) => typeof v === "string" && v.trim().length > 0;
  const dateTime = (v: unknown) =>
    typeof v === "string" &&
    /^\d{4}-\d\d-\d\dT/.test(v) &&
    isValid(new Date(v));
  for (const t of d.tasks) {
    if (
      !t ||
      !str(t.id) ||
      ids.has(t.id) ||
      !str(t.title) ||
      t.title.length > 200 ||
      ![1, 2, 3].includes(t.priority) ||
      !validDay(t.due) ||
      !["day", "week"].includes(t.kind) ||
      !dateTime(t.createdAt) ||
      (t.completedAt !== null && !dateTime(t.completedAt))
    )
      return fail();
    ids.add(t.id);
  }
  for (const h of d.habits) {
    if (
      !h ||
      !str(h.id) ||
      ids.has(h.id) ||
      !str(h.title) ||
      h.title.length > 100 ||
      ![
        "water",
        "book",
        "walk",
        "leaf",
        "sleep",
        "heart",
        "sun",
        "coffee",
      ].includes(h.icon) ||
      !/^#[0-9a-fA-F]{6}$/.test(h.color) ||
      !validDay(h.createdOn) ||
      !Number.isFinite(h.order) ||
      !Array.isArray(h.history) ||
      !h.history.every(validDay) ||
      new Set(h.history).size !== h.history.length
    )
      return fail();
    ids.add(h.id);
    const s = h.schedule;
    if (!s || !["daily", "weekdays", "interval"].includes(s.type))
      return fail();
    if (
      s.type === "weekdays" &&
      (!Array.isArray(s.days) ||
        !s.days.length ||
        !s.days.every((n) => Number.isInteger(n) && n >= 0 && n <= 6))
    )
      return fail();
    if (
      s.type === "interval" &&
      (!Number.isSafeInteger(s.every) || s.every < 1 || !validDay(s.anchor))
    )
      return fail();
  }
  return structuredClone({ version: 1, tasks: d.tasks, habits: d.habits });
}
