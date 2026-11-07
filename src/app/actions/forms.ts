"use server";

// Server Actions для двух открытых форм: бронь столика (главная) и подписка (подвал).
// Писать в эти таблицы может любой посетитель, а читает их только админ (правила RLS).
// В режиме портфолио ничего не сохраняем: это демо, чужие телефоны и почты нам не нужны.

import { BOOKING, IS_PORTFOLIO_MODE, OPENING_HOURS, formatHour } from "@/config/cafe";
import { warsawParts } from "@/lib/slots";
import { createServerSupabase } from "@/lib/supabase/server";

export type PublicFormState = {
  ok?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{7,20}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// 960 → "16:00"
function fromMinutes(total: number) {
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// Дата "2026-11-09" → номер дня от 1970 года (чтобы считать разницу в днях)
function dayNumber(year: number, month: number, day: number) {
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export async function requestBooking(_previous: PublicFormState, formData: FormData): Promise<PublicFormState> {
  const values = {
    name: text(formData, "name"),
    email: text(formData, "email").toLowerCase(),
    phone: text(formData, "phone"),
    seats: text(formData, "seats"),
    date: text(formData, "date"),
    time: text(formData, "time"),
  };
  const fieldErrors: Record<string, string> = {};

  if (values.name.length < 2 || values.name.length > 80) fieldErrors.name = "Enter your name.";
  if (!EMAIL_PATTERN.test(values.email)) fieldErrors.email = "Enter a valid email.";
  if (!PHONE_PATTERN.test(values.phone)) fieldErrors.phone = "Enter a phone number, e.g. +48 600 000 000.";

  const seats = Number(values.seats);
  if (!Number.isInteger(seats) || seats < BOOKING.minSeats || seats > BOOKING.maxSeats) {
    fieldErrors.seats = `From ${BOOKING.minSeats} to ${BOOKING.maxSeats} seats. For bigger groups, please call us.`;
  }

  // Дата: с сегодняшнего дня (по Варшаве) и не дальше, чем на 30 дней
  const now = warsawParts(new Date());
  const today = dayNumber(now.year, now.month, now.day);
  let bookingDay = NaN;
  let weekday = -1;
  if (DATE_PATTERN.test(values.date)) {
    const [year, month, day] = values.date.split("-").map(Number);
    bookingDay = dayNumber(year, month, day);
    weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  }
  if (Number.isNaN(bookingDay) || bookingDay < today || bookingDay > today + BOOKING.maxDaysAhead) {
    fieldErrors.date = `Choose a date within the next ${BOOKING.maxDaysAhead} days.`;
  }

  // Время: в часы работы, последнее — за час до закрытия; сегодня — не в прошлом
  if (!fieldErrors.date) {
    const hours = (OPENING_HOURS.weekdays.days as readonly number[]).includes(weekday)
      ? OPENING_HOURS.weekdays
      : OPENING_HOURS.weekends;
    const latest = toMinutes(hours.closes) - BOOKING.lastBookingBeforeCloseMinutes;
    const minutes = TIME_PATTERN.test(values.time) ? toMinutes(values.time) : NaN;
    const isPast = bookingDay === today && minutes <= now.hour * 60 + now.minute;
    if (Number.isNaN(minutes) || minutes < toMinutes(hours.opens) || minutes > latest || isPast) {
      fieldErrors.time = isPast
        ? "This time has already passed — choose a later one."
        : `On that day we take bookings from ${formatHour(hours.opens)} to ${formatHour(fromMinutes(latest))}.`;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values, error: "Please check the highlighted fields." };
  }

  if (IS_PORTFOLIO_MODE) {
    return {
      ok: true,
      message: "Thank you! This is a demo site, so no real booking was made — but this is where the cafe would get your request.",
    };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("table_bookings").insert({
    name: values.name,
    email: values.email,
    phone: values.phone,
    seats,
    booking_date: values.date,
    booking_time: values.time,
  });
  if (error) {
    return { values, error: "Sorry, we couldn’t send your request. Please try again or call us." };
  }

  return {
    ok: true,
    message: "Thank you! We’ve got your request and will call or email you to confirm the table.",
  };
}

export async function subscribeToNewsletter(_previous: PublicFormState, formData: FormData): Promise<PublicFormState> {
  const email = text(formData, "email").toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Enter a valid email.", values: { email } };
  }

  if (IS_PORTFOLIO_MODE) {
    return { ok: true, message: "Thanks! (Demo site — your email wasn’t saved.)" };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("newsletter_subscribers").insert({ email });
  // 23505 — такая почта уже есть в списке. Для гостя это тоже успех.
  if (error && error.code !== "23505") {
    return { error: "Sorry, something went wrong. Please try again.", values: { email } };
  }
  return { ok: true, message: "Thanks! You’re on the list." };
}
