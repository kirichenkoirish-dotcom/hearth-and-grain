"use client";

// Заявка на столик для компаний от 5 человек. Проверяет и сохраняет сервер (requestBooking).

import { useActionState, useState } from "react";
import { requestBooking, type PublicFormState } from "@/app/actions/forms";
import { BOOKING } from "@/config/cafe";

const inputClass =
  "h-[50px] w-full rounded-lg border border-black/20 bg-transparent px-[13px] text-lg font-medium text-black placeholder:text-black/60 focus:border-bark focus:outline-none aria-invalid:border-accent";

export function ReservationForm() {
  // При «Book another table» меняем key — форма создаётся заново, пустой
  const [attempt, setAttempt] = useState(0);
  return <BookingForm key={attempt} onReset={() => setAttempt((current) => current + 1)} />;
}

function BookingForm({ onReset }: { onReset: () => void }) {
  const [state, action, isSending] = useActionState<PublicFormState, FormData>(requestBooking, {});
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};

  if (state.ok) {
    return (
      <div role="status" className="flex flex-col items-start gap-5 md:p-5 lg:p-0 lg:pl-5">
        <h3 className="font-display text-[28px] leading-[1.2] font-medium tracking-[-0.36px] text-accent md:text-4xl">
          Request sent
        </h3>
        <p className="text-lg leading-[1.4] font-medium text-black/70">{state.message}</p>
        <button
          type="button"
          onClick={onReset}
          className="text-base font-medium text-black/60 underline-offset-4 transition-colors hover:text-black hover:underline"
        >
          Book another table
        </button>
      </div>
    );
  }

  // Ошибка у поля: текст под ним и красная рамка
  const fieldProps = (name: string) => ({
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `booking-${name}-error` : undefined,
    defaultValue: values[name],
  });

  return (
    <form action={action} noValidate className="flex flex-col gap-5 md:p-5 lg:p-0 lg:pl-5">
      <h3 className="font-display text-[28px] leading-[1.2] font-medium tracking-[-0.36px] text-accent md:text-4xl">
        Tables for {BOOKING.minSeats} or more
      </h3>

      <Field label="Name" name="name" error={errors.name}>
        <input id="booking-name" name="name" autoComplete="name" placeholder="Your name" required className={inputClass} {...fieldProps("name")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" name="email" error={errors.email}>
          <input
            id="booking-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            required
            className={inputClass}
            {...fieldProps("email")}
          />
        </Field>
        <Field label="Phone number" name="phone" error={errors.phone}>
          <input
            id="booking-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Your phone number"
            required
            className={inputClass}
            {...fieldProps("phone")}
          />
        </Field>
      </div>

      <Field label="Number of seats" name="seats" error={errors.seats}>
        <input
          id="booking-seats"
          name="seats"
          type="number"
          min={BOOKING.minSeats}
          max={BOOKING.maxSeats}
          required
          className={inputClass}
          {...fieldProps("seats")}
          defaultValue={values.seats ?? BOOKING.minSeats}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date" name="date" error={errors.date}>
          <input id="booking-date" name="date" type="date" required className={inputClass} {...fieldProps("date")} />
        </Field>
        <Field label="Time" name="time" error={errors.time}>
          <input id="booking-time" name="time" type="time" step={1800} required className={inputClass} {...fieldProps("time")} />
        </Field>
      </div>

      {state.error && (
        <p role="alert" className="text-base font-medium text-accent">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSending}
        className="btn-roast font-display rounded-full px-[30px] py-[15px] text-base leading-none font-medium tracking-[0.32px]"
      >
        {isSending ? "Sending…" : "Confirm my reservation"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={`booking-${name}`}
        className="font-display pl-2.5 text-xl leading-[1.2] font-medium tracking-[-0.24px] text-black/80 md:text-2xl"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`booking-${name}-error`} className="pl-2.5 text-sm font-medium text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
