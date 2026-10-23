import { addDays, format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Check,
  ChevronRight,
  Download,
  Leaf,
  MoreHorizontal,
  Plus,
  Settings,
  Upload,
  X,
  CheckCheck,
  ArrowLeft,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import type { Section } from "./models";
import { orderedHabits, scheduled, sectionFor } from "./logic";
import { usePlanner } from "./usePlanner";
import { Turtle } from "./components/Turtle";
import { HabitIcon } from "./components/Icons";
import { Modal, ModalStatus } from "./components/Modal";
import { TaskEditor } from "./components/TaskEditor";
import { HabitEditor } from "./components/HabitEditor";
import { HabitDetail } from "./components/HabitDetail";
import { TaskSection } from "./components/TaskSection";
export default function App() {
  const {
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
  } = usePlanner();
  return (
    <ModalStatus.Provider value={{ error, busy }}>
      <div className="app-shell">
        <header className="topbar">
          <a
            className="brand"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCompleted(false);
            }}
          >
            <span className="brand-mark">
              <Turtle />
            </span>
            <span>
              little turtle<span className="brand-sub">ЕЖЕДНЕВНЫЙ ПЛАННЕР</span>
            </span>
          </a>
          <div className="header-right">
            <span className="local-label">
              <span /> Всё на вашем устройстве
            </span>
            <button
              className="icon-button settings-button"
              aria-label="Настройки и резервные копии"
              onClick={() => setView({ type: "settings" })}
            >
              <Settings size={21} />
            </button>
          </div>
        </header>
        <main>
          <div className="date-line">
            <span>
              {format(parseISO(today), "EEEE, d MMMM", { locale: ru })}
            </span>
            <span className="date-leaf">
              <Leaf size={14} /> В своём темпе
            </span>
          </div>
          <section className="welcome">
            <div>
              <div className="eyebrow">МАЛЕНЬКИМИ ШАГАМИ К БОЛЬШОМУ</div>
              <h1>
                Хороший день
                <br />
                начинается с <em>маленького.</em>
              </h1>
              <p>
                Немного заботы о себе, немного важных дел.
                <br className="desktop-break" /> И пусть всё идёт своим чередом.
              </p>
              <div className="welcome-note">
                <span /> Не спеши. Ты уже на своём пути.
              </div>
            </div>
            <div className="hero-art">
              <span className="sparkle s1">✧</span>
              <span className="sparkle s2">✦</span>
              <span className="sparkle s3">✧</span>
              <div className="turtle-ground" />
              <Turtle />
              <span className="art-caption">всё получится</span>
              <Leaf className="art-leaf" size={36} />
            </div>
          </section>
          {offline && (
            <div className="notice">
              <WifiOff size={17} /> Вы офлайн. Все ваши записи доступны на
              устройстве.
            </div>
          )}
          {update && (
            <div className="notice">
              <RefreshCw size={17} /> Доступно обновление{" "}
              <button
                disabled={busy || view !== null}
                onClick={() => void updateRef.current?.(true)}
              >
                Обновить
              </button>
            </div>
          )}
          {error && (
            <div className="error" role="alert">
              {error}
              <button
                className="icon-button"
                aria-label="Скрыть сообщение"
                onClick={() => setError("")}
              >
                <X size={16} />
              </button>
              {loadFailed && (
                <button onClick={() => void initialize()}>
                  Повторить загрузку
                </button>
              )}
            </div>
          )}
          {!ready ? (
            <div className="loading">
              {loadFailed
                ? "Хранилище недоступно. Ваши данные не перезаписаны."
                : "Черепашка готовит ваш планнер…"}
            </div>
          ) : (
            <>
              <section className="habits-panel">
                <div className="habits-heading">
                  <div>
                    <h2>
                      Мои маленькие ритуалы <Leaf size={19} />
                    </h2>
                    <p>Хорошие привычки растут день за днём</p>
                  </div>
                  <span className="habit-progress">
                    {doneHabits} <span>из {activeHabits.length}</span>
                  </span>
                </div>
                <div className="habit-strip">
                  {orderedHabits(data.habits, today).map((h) => {
                    const done = h.history.includes(today);
                    const planned = scheduled(h, today);
                    return (
                      <div
                        className={`habit-item ${!planned ? "inactive" : ""}`}
                        key={h.id}
                      >
                        <button
                          disabled={busy || (!planned && !done)}
                          className={`habit-circle ${done ? "is-done" : ""}`}
                          style={{ background: h.color }}
                          aria-label={`${done ? "Отменить" : "Отметить"}: ${h.title}${!planned ? " (не запланировано сегодня)" : ""}`}
                          aria-pressed={done}
                          onClick={() => void toggleHabit(h)}
                        >
                          {done ? (
                            <Check size={28} />
                          ) : (
                            <HabitIcon name={h.icon} />
                          )}
                        </button>
                        <button
                          className="habit-title"
                          onClick={() => setView({ type: "detail", id: h.id })}
                        >
                          {h.title}
                        </button>
                        <button
                          className="habit-more"
                          aria-label={`Подробнее о привычке: ${h.title}`}
                          onClick={() => setView({ type: "detail", id: h.id })}
                        >
                          {!planned ? (
                            <span>не сегодня</span>
                          ) : (
                            <MoreHorizontal size={16} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                  <div className="habit-item new-habit">
                    <button
                      className="habit-circle"
                      aria-label="Добавить привычку"
                      onClick={() => setView({ type: "habit" })}
                    >
                      <Plus size={26} strokeWidth={1.4} />
                    </button>
                    <button
                      className="habit-title"
                      onClick={() => setView({ type: "habit" })}
                    >
                      Новая привычка
                    </button>
                  </div>
                  {!data.habits.length && (
                    <div className="habit-empty">
                      Начните с одного маленького ритуала.
                      <br />
                      <span>Выпить воды, почитать или выйти на прогулку?</span>
                    </div>
                  )}
                </div>
              </section>
              <div className="planner-toolbar">
                <div className="planner-tabs">
                  <button
                    className={!completed ? "active" : ""}
                    onClick={() => setCompleted(false)}
                  >
                    <Leaf size={17} /> Мои планы
                  </button>
                  <button
                    className={completed ? "active" : ""}
                    onClick={() => setCompleted(true)}
                  >
                    <CheckCheck size={17} /> Выполнено{" "}
                    <span>
                      {data.tasks.filter((t) => t.completedAt).length}
                    </span>
                  </button>
                </div>
                <span className="priority-guide">
                  <i className="priority p1" /> важное{" "}
                  <i className="priority p2" /> обычное{" "}
                  <i className="priority p3" /> не спеша
                </span>
              </div>
              {completed ? (
                <div className="completed-panel">
                  <button
                    className="back-link"
                    onClick={() => setCompleted(false)}
                  >
                    <ArrowLeft size={16} /> К планам
                  </button>
                  <TaskSection
                    section="today"
                    completed
                    tasks={data.tasks
                      .filter((t) => t.completedAt)
                      .sort((a, b) =>
                        b.completedAt!.localeCompare(a.completedAt!),
                      )}
                    today={today}
                    subtitle="Каждое сделанное дело — маленькая победа"
                    add={() => {}}
                    edit={(t) =>
                      setView({
                        type: "task",
                        section: sectionFor(t, today),
                        task: t,
                      })
                    }
                    toggle={toggleTask}
                    remove={removeTask}
                  />
                </div>
              ) : (
                <div className="task-grid">
                  {(["today", "tomorrow", "week"] as Section[]).map(
                    (section) => (
                      <TaskSection
                        key={section}
                        section={section}
                        tasks={activeTasks
                          .filter((t) => sectionFor(t, today) === section)
                          .sort(
                            (a, b) =>
                              a.priority - b.priority ||
                              a.createdAt.localeCompare(b.createdAt),
                          )}
                        today={today}
                        subtitle={
                          section === "today"
                            ? format(parseISO(today), "d MMMM", { locale: ru })
                            : section === "tomorrow"
                              ? format(addDays(parseISO(today), 1), "d MMMM", {
                                  locale: ru,
                                })
                              : "Без спешки, до воскресенья"
                        }
                        add={() => setView({ type: "task", section })}
                        edit={(t) =>
                          setView({ type: "task", section, task: t })
                        }
                        toggle={toggleTask}
                        remove={removeTask}
                      />
                    ),
                  )}
                </div>
              )}
              <section className="day-summary">
                <span className="summary-icon">
                  <Leaf size={22} />
                </span>
                <div>
                  <strong>
                    {todayTasks.length
                      ? `На сегодня задач: ${todayTasks.length}`
                      : "На сегодня всё спокойно"}
                  </strong>
                  <p>Не обязательно успевать всё. Достаточно самого важного.</p>
                </div>
                <span className="summary-flower">✳</span>
              </section>
            </>
          )}
        </main>
        <footer>
          <span>
            Сделано с заботой о твоём ритме <Leaf size={13} />
          </span>
          <span>
            little turtle planner <span className="footer-dot">·</span> без
            суеты и рекламы
          </span>
        </footer>
        {view?.type === "task" && (
          <TaskEditor
            task={view.task}
            section={view.section}
            today={today}
            onSave={saveTask}
            close={() => setView(null)}
          />
        )}{" "}
        {view?.type === "habit" && (
          <HabitEditor
            habit={view.habit}
            today={today}
            nextOrder={Math.max(-1, ...data.habits.map((h) => h.order)) + 1}
            onSave={saveHabit}
            close={() => setView(null)}
          />
        )}{" "}
        {detail && (
          <HabitDetail
            habit={detail}
            today={today}
            close={() => setView(null)}
            edit={() => setView({ type: "habit", habit: detail })}
            remove={() => void removeHabit(detail)}
          />
        )}
        {view?.type === "settings" && (
          <Modal title="Ваш уютный планнер" close={() => setView(null)}>
            <div className="settings-intro">
              <Turtle />
              <p>
                Ваши планы принадлежат только вам.
                <br />
                Без регистрации, рекламы и серверов.
              </p>
            </div>
            <h3>Резервная копия</h3>
            <p className="hint">
              Данные хранятся в этом браузере. Сохраняйте копию перед очисткой
              браузера или сменой телефона.
            </p>
            <button
              className="setting-action"
              disabled={!ready || busy}
              onClick={exportData}
            >
              <Download size={20} />
              <span>
                Экспортировать в JSON
                <small>Сохранить все задачи, привычки и историю</small>
              </span>
              <ChevronRight size={18} />
            </button>
            <button
              className="setting-action"
              disabled={!ready || busy}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={20} />
              <span>
                Восстановить из файла
                <small>Заменить данные резервной копией</small>
              </span>
              <ChevronRight size={18} />
            </button>
            <input
              ref={fileRef}
              className="sr-only"
              type="file"
              accept=".json,application/json"
              onChange={(e) => void importData(e.target.files?.[0])}
            />
            <h3>Всегда под рукой</h3>
            <p className="hint">
              Android: меню браузера → «Установить приложение». iPhone: Safari →
              «Поделиться» → «На экран Домой». После первой загрузки планнер
              работает без интернета.
            </p>
            <p className="hint">
              Записи из других вкладок загружаются при возвращении к планнеру.
              Сохраняйте резервные копии для переноса на другой телефон.
            </p>
          </Modal>
        )}
        {toast && (
          <div className="celebration" role="status">
            <Turtle happy />
            <span>{toast}</span>
          </div>
        )}
        {busy && (
          <span className="saving" role="status">
            Сохраняем…
          </span>
        )}
      </div>
    </ModalStatus.Provider>
  );
}
