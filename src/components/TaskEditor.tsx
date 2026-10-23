import type { Task, Section } from "../models";
import { dueFor } from "../logic";
import { Modal } from "./Modal";
export function TaskEditor({
  task,
  section,
  today,
  onSave,
  close,
}: {
  task?: Task;
  section: Section;
  today: string;
  onSave: (t: Task) => Promise<void>;
  close: () => void;
}) {
  return (
    <Modal
      title={task ? "Изменить задачу" : "Новая маленькая задача"}
      close={close}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          await onSave({
            ...task,
            id: task?.id || crypto.randomUUID(),
            title: String(f.get("title")).trim(),
            priority: Number(f.get("priority")) as 1 | 2 | 3,
            due: String(f.get("due")),
            kind: task?.kind || (section === "week" ? "week" : "day"),
            createdAt: task?.createdAt || new Date().toISOString(),
            completedAt: task?.completedAt || null,
          });
        }}
      >
        <label>
          Что хочется сделать?
          <input
            name="title"
            required
            maxLength={200}
            defaultValue={task?.title}
            autoFocus
            placeholder="Например, полить цветы"
            pattern=".*\S.*"
          />
        </label>
        <label>
          Приоритет
          <select name="priority" defaultValue={task?.priority || 2}>
            <option value="1">1 · Высокий</option>
            <option value="2">2 · Средний</option>
            <option value="3">3 · Низкий</option>
          </select>
        </label>
        <label>
          Срок
          <input
            type="date"
            name="due"
            required
            defaultValue={task?.due || dueFor(section, today)}
          />
        </label>
        <p className="hint">
          Недельные задачи по умолчанию запланированы до воскресенья.
          Просроченные появятся в «Сегодня».
        </p>
        <button className="primary" type="submit">
          Сохранить задачу
        </button>
      </form>
    </Modal>
  );
}
