import { useState } from "react";
import type { Habit, Schedule } from "../models";
import { Modal } from "./Modal";
import { HabitIcon, habitIcons, iconNames } from "./Icons";
const colors = [
  "#E5EEDC",
  "#E8DDD0",
  "#EAD8D4",
  "#DFE6EC",
  "#F0E6C7",
  "#DADFE9",
];
export function HabitEditor({
  habit,
  today,
  nextOrder,
  onSave,
  close,
}: {
  habit?: Habit;
  today: string;
  nextOrder: number;
  onSave: (h: Habit) => Promise<void>;
  close: () => void;
}) {
  const [icon, setIcon] = useState(habit?.icon || "water");
  const [color, setColor] = useState(habit?.color || colors[0]);
  const [type, setType] = useState<Schedule["type"]>(
    habit?.schedule.type || "daily",
  );
  const [days, setDays] = useState(
    habit?.schedule.type === "weekdays" ? habit.schedule.days : [1, 2, 3, 4, 5],
  );
  return (
    <Modal
      title={habit ? "Изменить привычку" : "Новая добрая привычка"}
      close={close}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (type === "weekdays" && !days.length) return;
          const f = new FormData(e.currentTarget);
          const schedule: Schedule =
            type === "daily"
              ? { type }
              : type === "weekdays"
                ? { type, days }
                : {
                    type,
                    every: Number(f.get("every")),
                    anchor: String(f.get("anchor")),
                  };
          await onSave({
            id: habit?.id || crypto.randomUUID(),
            title: String(f.get("title")).trim(),
            icon,
            color,
            schedule,
            createdOn: habit?.createdOn || today,
            order: habit?.order ?? nextOrder,
            history: habit?.history || [],
          });
        }}
      >
        <label>
          Название
          <input
            autoFocus
            name="title"
            required
            maxLength={100}
            defaultValue={habit?.title}
            placeholder="Например, читать 15 минут"
            pattern=".*\S.*"
          />
        </label>
        <fieldset>
          <legend>Выберите рисунок</legend>
          <div className="choices">
            {Object.keys(habitIcons).map((k) => (
              <button
                type="button"
                key={k}
                aria-label={iconNames[k as keyof typeof iconNames]}
                aria-pressed={icon === k}
                className={icon === k ? "chosen" : ""}
                onClick={() => setIcon(k)}
              >
                <HabitIcon name={k} />
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Цвет кружочка</legend>
          <div className="choices">
            {colors.map((c, i) => (
              <button
                type="button"
                key={c}
                aria-label={`Цвет ${i + 1}`}
                aria-pressed={color === c}
                className={color === c ? "chosen" : ""}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </fieldset>
        <label>
          Повторять
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Schedule["type"])}
          >
            <option value="daily">Каждый день</option>
            <option value="weekdays">По дням недели</option>
            <option value="interval">Каждые N дней</option>
          </select>
        </label>
        {type === "weekdays" && (
          <fieldset>
            <legend>Дни недели</legend>
            <div className="choices weekdays">
              {[1, 2, 3, 4, 5, 6, 0].map((d, i) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={days.includes(d)}
                  className={days.includes(d) ? "chosen" : ""}
                  onClick={() =>
                    setDays(
                      days.includes(d)
                        ? days.filter((x) => x !== d)
                        : [...days, d],
                    )
                  }
                >
                  {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][i]}
                </button>
              ))}
            </div>
            {!days.length && <p role="alert">Выберите хотя бы один день</p>}
          </fieldset>
        )}
        {type === "interval" && (
          <div className="form-row">
            <label>
              Каждые … дней
              <input
                type="number"
                min="1"
                max="3650"
                name="every"
                required
                defaultValue={
                  habit?.schedule.type === "interval" ? habit.schedule.every : 2
                }
              />
            </label>
            <label>
              Начиная с
              <input
                type="date"
                name="anchor"
                required
                defaultValue={
                  habit?.schedule.type === "interval"
                    ? habit.schedule.anchor
                    : today
                }
              />
            </label>
          </div>
        )}
        <button
          className="primary"
          disabled={type === "weekdays" && !days.length}
        >
          Сохранить привычку
        </button>
      </form>
    </Modal>
  );
}
