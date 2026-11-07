// Все «настройки кафе» в одном месте: если что-то поменяется
// (адрес, часы, цена доставки), правим только этот файл.

export const CAFE = {
  name: "Hearth & Grain",
  // Адрес настоящий (Старый город, рядом с Рыночной площадью) — чтобы карта показывала реальное место.
  // Само кафе, телефон и почта вымышленные.
  address: {
    street: "ul. Brzozowa 14",
    postalCode: "00-258",
    city: "Warszawa",
  },
  phone: "+48 22 555 01 48",
  email: "hello@hearthandgrain.pl",
  timeZone: "Europe/Warsaw",
} as const;

// Соцсети автора сайта (студия Senvori.Agency)
export const SOCIAL = {
  instagram: "https://www.instagram.com/senvori.agency/",
  youtube: "https://www.youtube.com/@IVELENSI_school/videos",
  // Telegram: @Iryna_webdesigner
  telegram: "https://t.me/Iryna_webdesigner",
} as const;

// Режим портфолио: сайт работает как настоящий, но заказ не сохраняется и оплаты нет —
// после «Pay» гость видит страницу «это портфолио-проект». Включается в настройках Vercel:
// NEXT_PUBLIC_PORTFOLIO_MODE=true. На своём компьютере (без этой настройки) работает настоящая оплата Stripe.
export const IS_PORTFOLIO_MODE = process.env.NEXT_PUBLIC_PORTFOLIO_MODE === "true";

// Доставка. Деньги — в грошах: 1000 = 10 zł
export const DELIVERY = {
  feeGrosze: 1000,
  // Минимум считается только по сумме блюд, без цены доставки
  minimumOrderGrosze: 4000,
  // Зона доставки — список почтовых индексов.
  // ⚠️ ТЕСТОВЫЕ индексы: настоящий список пришлёт хозяйка кафе.
  postalCodes: ["00-001", "00-258", "00-950", "02-495", "03-984"],
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

// Столики для заказа «за столиком» (номера 1…10, на каждом — QR-код)
export const TABLE_COUNT = 10;

// Бронь столика для компаний (форма на главной)
export const BOOKING = {
  minSeats: 5,
  maxSeats: 30,
  // Насколько вперёд можно оставить заявку
  maxDaysAhead: 30,
  // Последнее время брони — за час до закрытия
  lastBookingBeforeCloseMinutes: 60,
} as const;

// Время выбирается слотами
export const SLOTS = {
  lengthMinutes: 30,
  // Последний слот — за 30 минут до закрытия
  lastSlotBeforeCloseMinutes: 30,
  // Насколько вперёд можно заказать
  maxDaysAhead: 7,
  // Минимальное время на подготовку до ближайшего слота
  prepMinutes: { pickup: 20, dine_in: 20, delivery: 45 },
} as const;

export type OrderType = "delivery" | "pickup" | "dine_in";
