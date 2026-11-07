// Расчёт слотов времени для заказа. Всё время — по Варшаве, даже если сервер стоит в другой стране.
//
// Правила (см. CLAUDE.md):
// - слоты по 30 минут, от открытия до «закрытие минус 30 минут»;
// - ближайший слот — не раньше, чем через время подготовки (20 или 45 минут);
// - можно заказать на сегодня и ещё на 7 дней вперёд.

import { CAFE, OPENING_HOURS, SLOTS, type OrderType } from "@/config/cafe";

export type Slot = {
  // Точное время слота в формате ISO (UTC) — его и сохраняем в базу
  iso: string;
  // Подписи для гостя: "Today" / "Mon, 9 Nov" и "9:30 AM"
  dayLabel: string;
  timeLabel: string;
};

const MINUTE = 60_000;

// Какие год, месяц, день, час, минута и день недели сейчас в Варшаве для этого момента
export function warsawParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CAFE.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    weekday: weekdays.indexOf(get("weekday")),
  };
}

// «9:30 в Варшаве такого-то дня» → точный момент времени.
// Смещение Варшавы меняется летом и зимой, поэтому вычисляем его, а не пишем +1 или +2.
function warsawTimeToDate(year: number, month: number, day: number, hour: number, minute: number) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const parts = warsawParts(new Date(guess));
  const asIfUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  return new Date(guess - (asIfUtc - guess));
}

function hoursForWeekday(weekday: number) {
  const schedule = (OPENING_HOURS.weekdays.days as readonly number[]).includes(weekday)
    ? OPENING_HOURS.weekdays
    : OPENING_HOURS.weekends;
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  return { opens: toMinutes(schedule.opens), closes: toMinutes(schedule.closes) };
}

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CAFE.timeZone,
  hour: "numeric",
  minute: "2-digit",
});
const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: CAFE.timeZone,
  weekday: "short",
  day: "numeric",
  month: "short",
});

// Все свободные слоты для самовывоза или доставки, начиная с ближайшего
export function getAvailableSlots(orderType: Exclude<OrderType, "dine_in">, now = new Date()): Slot[] {
  const earliest = now.getTime() + SLOTS.prepMinutes[orderType] * MINUTE;
  const today = warsawParts(now);
  const slots: Slot[] = [];

  for (let dayOffset = 0; dayOffset <= SLOTS.maxDaysAhead; dayOffset++) {
    // Полдень нужного дня — чтобы узнать дату и день недели без путаницы с переводом часов
    const noon = warsawTimeToDate(today.year, today.month, today.day + dayOffset, 12, 0);
    const day = warsawParts(noon);
    const { opens, closes } = hoursForWeekday(day.weekday);
    const lastSlot = closes - SLOTS.lastSlotBeforeCloseMinutes;

    for (let minutes = opens; minutes <= lastSlot; minutes += SLOTS.lengthMinutes) {
      const slotDate = warsawTimeToDate(day.year, day.month, day.day, Math.floor(minutes / 60), minutes % 60);
      if (slotDate.getTime() < earliest) continue;
      slots.push({
        iso: slotDate.toISOString(),
        dayLabel: dayOffset === 0 ? "Today" : dayOffset === 1 ? "Tomorrow" : dayFormatter.format(slotDate),
        timeLabel: timeFormatter.format(slotDate),
      });
    }
  }
  return slots;
}

// Открыто ли кафе прямо сейчас и успеет ли кухня приготовить заказ «за столиком» до закрытия
export function canOrderAtTableNow(now = new Date()) {
  const current = warsawParts(now);
  const { opens, closes } = hoursForWeekday(current.weekday);
  const minutesNow = current.hour * 60 + current.minute;
  return minutesNow >= opens && minutesNow + SLOTS.prepMinutes.dine_in <= closes;
}
