import {
  BookOpen,
  Coffee,
  Droplets,
  Footprints,
  Heart,
  Leaf,
  Moon,
  Sun,
} from "lucide-react";
export const habitIcons = {
  water: Droplets,
  book: BookOpen,
  walk: Footprints,
  leaf: Leaf,
  sleep: Moon,
  heart: Heart,
  sun: Sun,
  coffee: Coffee,
};
export const iconNames = {
  water: "Вода",
  book: "Чтение",
  walk: "Прогулка",
  leaf: "Забота",
  sleep: "Сон",
  heart: "Здоровье",
  sun: "Солнце",
  coffee: "Отдых",
};
export function HabitIcon({
  name,
  size = 26,
}: {
  name: string;
  size?: number;
}) {
  const Icon = habitIcons[name as keyof typeof habitIcons] || Leaf;
  return <Icon size={size} strokeWidth={1.6} />;
}
