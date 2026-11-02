// Все «настройки кафе» в одном месте: если что-то поменяется
// (адрес, часы, цена доставки), правим только этот файл.

export const CAFE = {
  name: "Hearth & Grain",
  // Вымышленные данные вместо американских из Figma
  address: {
    street: "ul. Brzozowa 14",
    postalCode: "00-950",
    city: "Warszawa",
  },
  phone: "+48 22 555 01 48",
  timeZone: "Europe/Warsaw",
} as const;

// Часы работы. Дни недели: 0 — воскресенье, 1 — понедельник … 6 — суббота
export const OPENING_HOURS = {
  weekdays: { days: [1, 2, 3, 4, 5], opens: "07:00", closes: "17:00" },
  weekends: { days: [0, 6], opens: "08:00", closes: "16:00" },
} as const;

// Время в формате, который видит гость: "07:00" → "7:00 AM"
export function formatHour(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours < 12 ? "AM" : "PM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}
