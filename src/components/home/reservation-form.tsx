"use client";

// Пока только внешний вид. Сохранять заявку в базу (таблица table_bookings) будем на этапе 9.

const inputClass =
  "h-[50px] w-full rounded-lg border border-black/20 bg-transparent px-[13px] text-lg font-medium text-black placeholder:text-black/60 focus:border-bark focus:outline-none";

export function ReservationForm() {
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-5 md:p-5 lg:p-0 lg:pl-5"
    >
      <h3 className="font-display text-[28px] leading-[1.2] font-medium tracking-[-0.36px] text-accent md:text-4xl">
        Tables for 5 or more
      </h3>

      <Field label="Name" htmlFor="booking-name">
        <input id="booking-name" name="name" autoComplete="name" placeholder="Your name" required className={inputClass} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" htmlFor="booking-email">
          <input
            id="booking-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            required
            className={inputClass}
          />
        </Field>
        <Field label="Phone number" htmlFor="booking-phone">
          <input
            id="booking-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Your phone number"
            required
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Number of seats" htmlFor="booking-seats">
        <input
          id="booking-seats"
          name="seats"
          type="number"
          min={5}
          defaultValue={5}
          required
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date" htmlFor="booking-date">
          <input id="booking-date" name="date" type="date" required className={inputClass} />
        </Field>
        <Field label="Time" htmlFor="booking-time">
          <input id="booking-time" name="time" type="time" step={1800} required className={inputClass} />
        </Field>
      </div>

      <button
        type="submit"
        className="btn-roast font-display rounded-full px-[30px] py-[15px] text-base leading-none font-medium tracking-[0.32px]"
      >
        Confirm my reservation
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="font-display pl-2.5 text-xl leading-[1.2] font-medium tracking-[-0.24px] text-black/80 md:text-2xl"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
