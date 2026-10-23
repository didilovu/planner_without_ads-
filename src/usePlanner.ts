import { useEffect, useRef, useState } from "react";
import { registerSW } from "virtual:pwa-register";
import type { Data, Habit, Section, Task } from "./models";
import { emptyData } from "./models";
import {
  dayKey,
  scheduled,
  sectionFor,
  toggleHistory,
  validateData,
} from "./logic";
import { loadData, updateData } from "./storage";
type View =
  | { type: "task"; section: Section; task?: Task }
  | { type: "habit"; habit?: Habit }
  | { type: "detail"; id: string }
  | { type: "settings" }
  | null;
const phrases = [
  "Маленький шаг, большой успех!",
  "Черепашка тобой гордится!",
  "Ещё одна победа!",
  "Ты сегодня молодец!",
  "Тихонько, но вперёд!",
];
export function usePlanner() {
  const [data, setData] = useState<Data>(emptyData);
  const dataRef = useRef(data);
  const [ready, setReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const revisionRef = useRef(0);
  const [today, setToday] = useState(dayKey());
  const [view, setView] = useState<View>(null);
  const [completed, setCompleted] = useState(false);
  const [toast, setToast] = useState("");
  const [offline, setOffline] = useState(!navigator.onLine);
  const [update, setUpdate] = useState(false);
  const updateRef = useRef<((reload?: boolean) => Promise<void>) | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const initialize = async () => {
    try {
      const d = await loadData();
      dataRef.current = d;
      setData(d);
      setReady(true);
      setLoadFailed(false);
      setError("");
    } catch {
      setLoadFailed(true);
      setError(
        "Не удалось открыть локальное хранилище. Разрешите сохранение данных в браузере и попробуйте снова.",
      );
    }
  };
  useEffect(() => {
    void initialize();
    const refresh = () => {
      setToday(dayKey());
      const revision = revisionRef.current;
      if (document.visibilityState === "visible" && !busyRef.current)
        void loadData()
          .then((d) => {
            if (!busyRef.current && revision === revisionRef.current) {
              dataRef.current = d;
              setData(d);
            }
          })
          .catch(() => {});
    };
    const online = () => setOffline(!navigator.onLine);
    const interval = setInterval(refresh, 15000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", online);
    window.addEventListener("offline", online);
    updateRef.current = registerSW({
      onNeedRefresh() {
        setUpdate(true);
      },
      onRegisterError() {
        setError(
          "Не удалось подготовить офлайн-режим. Проверьте подключение и перезагрузите страницу.",
        );
      },
    });
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", online);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(timer);
  }, [toast]);
  async function commit(change: (d: Data) => Data) {
    if (busyRef.current || !ready) return false;
    busyRef.current = true;
    revisionRef.current++;
    setBusy(true);
    try {
      const next = await updateData(change);
      dataRef.current = next;
      setData(next);
      setError("");
      return true;
    } catch {
      setError(
        "Не удалось сохранить изменения. Данные не изменены. Возможно, хранилище заполнено или недоступно. Экспортируйте резервную копию.",
      );
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const saveTask = async (t: Task) => {
    if (
      await commit((d) => ({
        ...d,
        tasks: d.tasks.some((x) => x.id === t.id)
          ? d.tasks.map((x) =>
              x.id === t.id
                ? { ...t, createdAt: x.createdAt, completedAt: x.completedAt }
                : x,
            )
          : [...d.tasks, t],
      }))
    )
      setView(null);
  };
  const saveHabit = async (h: Habit) => {
    if (
      await commit((d) => ({
        ...d,
        habits: d.habits.some((x) => x.id === h.id)
          ? d.habits.map((x) =>
              x.id === h.id ? { ...h, history: x.history } : x,
            )
          : [...d.habits, h],
      }))
    )
      setView(null);
  };
  const toggleTask = (t: Task) =>
    void commit((d) => ({
      ...d,
      tasks: d.tasks.map((x) =>
        x.id === t.id
          ? {
              ...x,
              completedAt: x.completedAt ? null : new Date().toISOString(),
            }
          : x,
      ),
    }));
  const removeTask = (t: Task) => {
    if (confirm(`Удалить задачу «${t.title}»?`))
      void commit((d) => ({
        ...d,
        tasks: d.tasks.filter((x) => x.id !== t.id),
      }));
  };
  const removeHabit = async (h: Habit) => {
    if (
      confirm(`Удалить «${h.title}» и всю историю этой привычки?`) &&
      (await commit((d) => ({
        ...d,
        habits: d.habits.filter((x) => x.id !== h.id),
      })))
    )
      setView(null);
  };
  const toggleHabit = async (h: Habit) => {
    const now = dayKey();
    setToday(now);
    if (!scheduled(h, now) && !h.history.includes(now)) return;
    const done = h.history.includes(now);
    if (
      (await commit((d) => ({
        ...d,
        habits: d.habits.map((x) =>
          x.id === h.id ? toggleHistory(x, now) : x,
        ),
      }))) &&
      !done
    )
      setToast(phrases[Math.floor(Math.random() * phrases.length)]);
  };
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(dataRef.current, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `little-turtle-${dayKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function importData(file?: File) {
    if (!file) return;
    try {
      if (file.size > 20 * 1024 * 1024)
        throw new Error("Файл слишком большой (максимум 20 МБ).");
      const next = validateData(JSON.parse(await file.text()));
      if (
        confirm(
          `Восстановить ${next.tasks.length} задач и ${next.habits.length} привычек? Текущие данные будут заменены. Сначала рекомендуем сделать экспорт.`,
        ) &&
        (await commit(() => next))
      ) {
        setView(null);
        setToast("Резервная копия восстановлена");
      }
    } catch (e) {
      setError(
        e instanceof SyntaxError
          ? "Не удалось прочитать JSON. Выберите файл резервной копии планнера."
          : e instanceof Error
            ? e.message
            : "Не удалось прочитать файл.",
      );
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  const activeHabits = data.habits.filter((h) => scheduled(h, today));
  const doneHabits = activeHabits.filter((h) =>
    h.history.includes(today),
  ).length;
  const activeTasks = data.tasks.filter((t) => !t.completedAt);
  const todayTasks = activeTasks.filter(
    (t) => sectionFor(t, today) === "today",
  );
  const detail =
    view?.type === "detail"
      ? data.habits.find((h) => h.id === view.id)
      : undefined;
  return {
    data,
    ready,
    loadFailed,
    error,
    busy,
    today,
    view,
    setView,
    completed,
    setCompleted,
    toast,
    offline,
    update,
    updateRef,
    fileRef,
    initialize,
    setError,
    saveTask,
    saveHabit,
    toggleTask,
    removeTask,
    removeHabit,
    toggleHabit,
    exportData,
    importData,
    activeHabits,
    doneHabits,
    activeTasks,
    todayTasks,
    detail,
  };
}
