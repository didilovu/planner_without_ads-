import { useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ru } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  CalendarDays,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Habit } from "../models";
import { dayKey, scheduled } from "../logic";
import { Modal } from "./Modal";
import { HabitIcon } from "./Icons";
export function HabitDetail({
  habit,
  today,
  close,
  edit,
  remove,
}: {
  habit: Habit;
  today: string;
  close: () => void;
  edit: () => void;
  remove: () => void;
}) {
  const [calendar, setCalendar] = useState(false);
  const [month, setMonth] = useState(startOfMonth(parseISO(today)));
  const first = startOfWeek(month, { weekStartsOn: 1 });
  const last = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const dates = [];
  for (let d = first; d <= last; d = addDays(d, 1)) dates.push(d);
  const monthKey = format(month, "yyyy-MM");
  const count = habit.history.filter((d) => d.startsWith(monthKey)).length;
  const s = habit.schedule;
  const repeat =
    s.type === "daily"
      ? "Каждый день"
      : s.type === "interval"
        ? `Каждые ${s.every} дн. с ${format(parseISO(s.anchor), "d MMMM yyyy", { locale: ru })}`
        : `По дням: ${s.days.map((n) => ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][n]).join(", ")}`;
  return (
    <Modal title={calendar ? "История привычки" : habit.title} close={close}>
      {!calendar ? (
        <>
          <div className="habit-detail">
            <span className="detail-circle" style={{ background: habit.color }}>
              <HabitIcon name={habit.icon} size={38} />
            </span>
            <h3>{habit.title}</h3>
            <p>{repeat}</p>
            <p className="hint">Всего выполнений: {habit.history.length}</p>
          </div>
          <button className="primary" onClick={() => setCalendar(true)}>
            <CalendarDays size={18} /> Отслеживание выполнения привычки
          </button>
          <div className="detail-actions">
            <button onClick={edit}>
              <Pencil size={16} /> Изменить
            </button>
            <button className="danger" onClick={remove}>
              <Trash2 size={16} /> Удалить
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="calendar-title">{habit.title}</p>
          <div className="month-nav">
            <button
              className="icon-button"
              aria-label="Предыдущий месяц"
              onClick={() => setMonth(addMonths(month, -1))}
            >
              <ChevronLeft />
            </button>
            <h3>{format(month, "LLLL yyyy", { locale: ru })}</h3>
            <button
              className="icon-button"
              aria-label="Следующий месяц"
              onClick={() => setMonth(addMonths(month, 1))}
            >
              <ChevronRight />
            </button>
          </div>
          <div className="calendar">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
              <span className="weekday" key={d}>
                {d}
              </span>
            ))}
            {dates.map((date) => {
              const key = dayKey(date);
              const done = habit.history.includes(key);
              const planned = scheduled(habit, key);
              return (
                <div
                  key={key}
                  className={[
                    "calendar-day",
                    key.startsWith(monthKey) ? "" : "other-month",
                    done
                      ? "done"
                      : !planned
                        ? "not-planned"
                        : key > today
                          ? "future"
                          : "missed",
                    key === today ? "current" : "",
                  ].join(" ")}
                  aria-label={`${format(date, "d MMMM yyyy", { locale: ru })}: ${done ? "выполнено" : !planned ? "не запланировано" : key > today ? "впереди" : "нет отметки"}`}
                >
                  <span>{date.getDate()}</span>
                  {done && <Check size={12} />}
                </div>
              );
            })}
          </div>
          <div className="calendar-legend">
            <span>● Выполнено</span>
            <span>· Не запланировано</span>
            <span>○ Нет отметки</span>
          </div>
          <p className="month-count">
            {count} <span>выполнений за месяц</span>
          </p>
          <p className="hint">
            Будущие дни не считаются пропущенными. Изменение расписания меняет
            плановые дни, сохраняя все отметки.
          </p>
        </>
      )}
    </Modal>
  );
}
