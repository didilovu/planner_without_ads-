import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import { loadData, saveData } from "./storage";
import { emptyData, type Habit } from "./models";
it("сохраняет и восстанавливает историю IndexedDB между открытиями", async () => {
  expect(await loadData()).toEqual(emptyData());
  const h: Habit = {
    id: "test",
    title: "Чтение",
    icon: "book",
    color: "#E5EEDC",
    schedule: { type: "daily" },
    createdOn: "2026-01-01",
    order: 0,
    history: ["2026-01-01", "2026-01-03"],
  };
  const data = { ...emptyData(), habits: [h] };
  await saveData(data);
  expect(await loadData()).toEqual(data);
  await saveData({ ...data, habits: [{ ...h, title: "Книга" }] });
  expect((await loadData()).habits[0].history).toEqual(h.history);
});

it("объединяет одновременные изменения без потери записей", async () => {
  const { updateData } = await import("./storage");
  await saveData(emptyData());
  await Promise.all(
    ["a", "b"].map((id) =>
      updateData((d) => ({
        ...d,
        tasks: [
          ...d.tasks,
          {
            id,
            title: id,
            priority: 2,
            due: "2026-01-01",
            kind: "day",
            createdAt: "2026-01-01T10:00:00Z",
            completedAt: null,
          },
        ],
      })),
    ),
  );
  expect((await loadData()).tasks.map((t) => t.id)).toEqual(["a", "b"]);
});
