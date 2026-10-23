import { Check, Plus, Pencil, Trash2 } from "lucide-react";
import type { Task, Section } from "../models";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
export const sectionTitles = {
  today: "Сегодня",
  tomorrow: "Завтра",
  week: "В течение недели",
};
export function TaskSection({
  section,
  tasks,
  today,
  subtitle,
  add,
  edit,
  toggle,
  remove,
  completed = false,
}: {
  section: Section;
  tasks: Task[];
  today: string;
  subtitle: string;
  add: () => void;
  edit: (t: Task) => void;
  toggle: (t: Task) => void;
  remove: (t: Task) => void;
  completed?: boolean;
}) {
  return (
    <section className={`task-section ${section}`}>
      <div className="section-heading">
        <div>
          <h2>
            {completed ? "Выполненные задачи" : sectionTitles[section]}{" "}
            <span className="count">{tasks.length}</span>
          </h2>
          <p>{subtitle}</p>
        </div>
        {!completed && (
          <button
            className="add-button"
            onClick={add}
            aria-label={`Добавить задачу: ${sectionTitles[section]}`}
          >
            <Plus size={21} />
          </button>
        )}
      </div>
      <div className="task-list">
        {!tasks.length && (
          <div className="empty-tasks">
            {completed
              ? "Здесь появятся ваши маленькие победы."
              : "Пока свободно. Оставим место для хорошего."}
          </div>
        )}
        {tasks.map((t) => (
          <article
            className={`task ${t.completedAt ? "completed" : ""}`}
            key={t.id}
          >
            <button
              className="checkbox"
              aria-label={
                t.completedAt
                  ? `Вернуть задачу: ${t.title}`
                  : `Выполнить: ${t.title}`
              }
              aria-pressed={!!t.completedAt}
              onClick={() => toggle(t)}
            >
              {t.completedAt && <Check size={17} />}
            </button>
            <div className="task-content">
              <span className="task-name">{t.title}</span>
              {!t.completedAt && t.due < today && (
                <small>
                  Перенесено с{" "}
                  {format(parseISO(t.due), "d MMM", { locale: ru })}
                </small>
              )}
              {t.completedAt && (
                <small>
                  Выполнено{" "}
                  {format(parseISO(t.completedAt), "d MMM, HH:mm", {
                    locale: ru,
                  })}
                </small>
              )}
              {section === "week" && !t.completedAt && (
                <small>
                  До {format(parseISO(t.due), "d MMM", { locale: ru })}
                </small>
              )}
            </div>
            <span
              className={`priority p${t.priority}`}
              title={`Приоритет ${t.priority}`}
              aria-label={`Приоритет ${t.priority}`}
            />
            <div className="task-actions">
              <button
                className="icon-button"
                onClick={() => edit(t)}
                aria-label={`Изменить: ${t.title}`}
              >
                <Pencil size={15} />
              </button>
              <button
                className="icon-button"
                onClick={() => remove(t)}
                aria-label={`Удалить: ${t.title}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!completed && (
        <button className="add-task" onClick={add}>
          <Plus size={16} /> Добавить задачу
        </button>
      )}
    </section>
  );
}
