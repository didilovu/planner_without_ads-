import { describe, it, expect } from "vitest";
import {
  dayKey,
  dueFor,
  orderedHabits,
  scheduled,
  sectionFor,
  toggleHistory,
  validateData,
  validDay,
} from "./logic";
import { emptyData, type Habit, type Task } from "./models";
const h: Habit = {
  id: "h",
  title: "Вода",
  icon: "water",
  color: "#E5EEDC",
  schedule: { type: "daily" },
  createdOn: "2026-01-01",
  order: 0,
  history: [],
};
const t: Task = {
  id: "t",
  title: "Задача",
  priority: 1,
  due: "2026-01-01",
  kind: "day",
  createdAt: "2026-01-01T10:00:00Z",
  completedAt: null,
};
describe("Локальные даты и перенос", () => {
  it("не сдвигает локальный день из-за UTC", () =>
    expect(dayKey(new Date(2026, 0, 2, 0, 5))).toBe("2026-01-02"));
  it("сохраняет исходную задачу после многодневного переноса", () => {
    expect(sectionFor(t, "2026-02-20")).toBe("today");
    expect(t.due).toBe("2026-01-01");
  });
  it("переводит завтрашнюю задачу в сегодня", () => {
    const next = { ...t, due: "2026-01-02" };
    expect(sectionFor(next, "2026-01-01")).toBe("tomorrow");
    expect(sectionFor(next, "2026-01-02")).toBe("today");
  });
  it("недельный срок воскресенье, затем перенос", () => {
    expect(dueFor("week", "2026-01-05")).toBe("2026-01-11");
    expect(dueFor("week", "2026-01-11")).toBe("2026-01-11");
    expect(
      sectionFor({ ...t, kind: "week", due: "2026-01-11" }, "2026-01-12"),
    ).toBe("today");
  });
  it("правильно проходит год и високосный февраль", () => {
    expect(dueFor("tomorrow", "2024-02-28")).toBe("2024-02-29");
    expect(dueFor("tomorrow", "2026-12-31")).toBe("2027-01-01");
    expect(validDay("2026-02-30")).toBe(false);
  });
});
describe("Привычки и история", () => {
  it("учитывает дни недели и дату создания", () => {
    const habit = {
      ...h,
      schedule: { type: "weekdays" as const, days: [1, 3] },
    };
    expect(scheduled(habit, "2026-01-05")).toBe(true);
    expect(scheduled(habit, "2026-01-06")).toBe(false);
    expect(scheduled(habit, "2025-12-31")).toBe(false);
  });
  it("считает интервал календарными днями с исходной даты", () => {
    const habit = {
      ...h,
      schedule: { type: "interval" as const, every: 3, anchor: "2026-03-27" },
    };
    expect(scheduled(habit, "2026-03-30")).toBe(true);
    expect(scheduled(habit, "2026-03-29")).toBe(false);
    expect(scheduled(habit, "2026-03-26")).toBe(false);
  });
  it("не удаляет историю при наступлении следующего дня", () => {
    const done = toggleHistory(h, "2026-01-05");
    expect(done.history).toEqual(["2026-01-05"]);
    expect(done.history.includes("2026-01-06")).toBe(false);
    expect(toggleHistory(done, "2026-01-06").history).toEqual([
      "2026-01-05",
      "2026-01-06",
    ]);
    expect(toggleHistory(done, "2026-01-05").history).toEqual([]);
  });
  it("сортирует стабильно внутри групп и восстанавливает порядок при отмене", () => {
    const b = { ...h, id: "b", order: 1 };
    const done = toggleHistory(h, "2026-01-05");
    expect(orderedHabits([done, b], "2026-01-05").map((x) => x.id)).toEqual([
      "b",
      "h",
    ]);
    expect(
      orderedHabits([toggleHistory(done, "2026-01-05"), b], "2026-01-05").map(
        (x) => x.id,
      ),
    ).toEqual(["h", "b"]);
  });
});
describe("Резервные копии", () => {
  it("принимает полный формат без потери истории", () => {
    const data = {
      ...emptyData(),
      tasks: [t],
      habits: [toggleHistory(h, "2026-01-05")],
    };
    expect(validateData(JSON.parse(JSON.stringify(data)))).toEqual(data);
  });
  it.each([
    null,
    {},
    { version: 2, tasks: [], habits: [] },
    { ...emptyData(), tasks: [{ ...t, priority: 9 }] },
    {
      ...emptyData(),
      habits: [
        {
          ...h,
          schedule: { type: "interval", every: 0, anchor: "2026-01-01" },
        },
      ],
    },
    { ...emptyData(), habits: [{ ...h, history: ["bad"] }] },
    { ...emptyData(), tasks: [t, t] },
  ])("отклоняет некорректные данные %#", (v) =>
    expect(() => validateData(v)).toThrow(),
  );
});

it("интервал не зависит от длины суток при переходе на летнее время", () => {
  const habit = {
    ...h,
    schedule: { type: "interval" as const, every: 2, anchor: "2026-03-07" },
  };
  expect(scheduled(habit, "2026-03-09")).toBe(true);
  expect(scheduled(habit, "2026-03-08")).toBe(false);
});
