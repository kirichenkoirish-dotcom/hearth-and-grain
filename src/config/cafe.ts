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

// Доставка. Деньги — в грошах: 1000 = 10 zł
export const DELIVERY = {
  feeGrosze: 1000,
  // Минимум считается только по сумме блюд, без цены доставки
  minimumOrderGrosze: 4000,
  // Зона доставки — список почтовых индексов.
  // ⚠️ ТЕСТОВЫЕ индексы: настоящий список пришлёт хозяйка кафе.
  postalCodes: ["00-001", "00-950", "02-495", "03-984"],
} as const;

// Польский почтовый индекс: две цифры, дефис, три цифры (00-950)
export const POSTAL_CODE_PATTERN = /^\d{2}-\d{3}$/;

export function isInDeliveryZone(postalCode: string) {
  return (DELIVERY.postalCodes as readonly string[]).includes(postalCode);
}

// Сколько штук одного блюда можно положить в корзину
export const MAX_QUANTITY_PER_DISH = 20;

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
