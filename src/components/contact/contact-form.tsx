"use client";

// Форма «Send a message» на странице контактов. Проверяет и сохраняет сервер (sendContactMessage).

import Image from "next/image";
import { useActionState, useState } from "react";
import { sendContactMessage, type PublicFormState } from "@/app/actions/forms";

const fieldClass =
  "w-full rounded-lg border border-black/20 bg-white/30 px-[13px] text-lg font-medium text-black placeholder:text-black/50 focus:border-bark focus:outline-none aria-invalid:border-accent";

export function ContactForm() {
  // «Send another message» — новый key, форма создаётся пустой
  const [attempt, setAttempt] = useState(0);
  return <MessageForm key={attempt} onReset={() => setAttempt((current) => current + 1)} />;
}

function MessageForm({ onReset }: { onReset: () => void }) {
  const [state, action, isSending] = useActionState<PublicFormState, FormData>(sendContactMessage, {});
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};

  if (state.ok) {
    return (
      <div role="status" className="flex flex-col items-start gap-4">
        <p className="font-display text-2xl font-medium text-accent">Message sent</p>
        <p className="text-lg leading-[1.4] font-medium text-black/70">{state.message}</p>
        <button
          type="button"
          onClick={onReset}
          className="text-base font-medium text-black/60 underline-offset-4 transition-colors hover:text-black hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  const fieldProps = (name: string) => ({
    id: `contact-${name}`,
    name,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
    defaultValue: values[name],
  });

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" name="name" error={errors.name}>
          <input {...fieldProps("name")} autoComplete="name" placeholder="Your name" className={`${fieldClass} h-[50px]`} />
        </Field>
        <Field label="Your email" name="email" error={errors.email}>
          <input
            {...fieldProps("email")}
            type="email"
            autoComplete="email"
            placeholder="Your email"
            className={`${fieldClass} h-[50px]`}
          />
        </Field>
      </div>
      <Field label="Your message" name="message" error={errors.message}>
        <textarea {...fieldProps("message")} rows={4} placeholder="Your message" className={`${fieldClass} resize-y py-3`} />
      </Field>

      {state.error && (
        <p role="alert" className="text-base font-medium text-accent">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSending}
        className="btn-roast group font-display flex items-center gap-3 self-start rounded-full px-[30px] py-[15px] text-base leading-none font-medium tracking-[0.32px]"
      >
        {isSending ? "Sending…" : "Send message"}
        <Image
          src="/images/icon-arrow-light.svg"
          alt=""
          width={20}
          height={20}
          className="rotate-270 transition-transform group-hover:translate-x-1"
        />
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
    <div className="flex flex-col gap-1.5">
      {/* Подпись видна только программам чтения экрана: в макете вместо неё текст внутри поля */}
      <label htmlFor={`contact-${name}`} className="sr-only">
        {label}
      </label>
      {children}
      {error && (
        <p id={`contact-${name}-error`} className="pl-2.5 text-sm font-medium text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
