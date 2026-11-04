"use client";

// "use client" — форма меняется на глазах: сначала поле почты, потом «Check your email».

import { useActionState, useState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

const inputClass =
  "h-[50px] w-full rounded-lg border border-black/20 bg-transparent px-[13px] text-lg font-medium text-black placeholder:text-black/50 focus:border-bark focus:outline-none";

export function LoginForm({ linkError }: { linkError: boolean }) {
  // При «Use a different email» меняем key — React создаёт форму заново, с чистого листа
  const [attempt, setAttempt] = useState(0);
  return (
    <EmailFlow
      key={attempt}
      linkError={linkError && attempt === 0}
      onReset={() => setAttempt((current) => current + 1)}
    />
  );
}

function EmailFlow({ linkError, onReset }: { linkError: boolean; onReset: () => void }) {
  // useActionState хранит ответ сервера: какой сейчас шаг и есть ли ошибка
  const [state, sendAction, isSending] = useActionState<LoginState, FormData>(sendMagicLink, {
    step: "email",
    error: linkError
      ? "That sign-in link didn’t work — it may have expired or been opened in another browser. Request a new one below."
      : undefined,
  });

  if (state.step === "sent") {
    return <CheckEmail email={state.email} onReset={onReset} />;
  }

  return (
    <form action={sendAction} className="flex flex-col gap-5">
      <h2 className="font-display text-[28px] leading-[1.2] font-medium tracking-[-0.36px] text-accent md:text-4xl">
        Sign in or create an account
      </h2>
      <p className="text-lg leading-[1.4] font-medium text-black/60">
        No password needed. We’ll email you a link — just tap it to sign in.
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor="login-email" className="font-display pl-2.5 text-xl font-medium text-black/80">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
          placeholder="you@email.com"
          aria-describedby={state.error ? "login-error" : undefined}
          className={inputClass}
        />
      </div>

      {state.error && (
        <p id="login-error" role="alert" className="text-base font-medium text-accent">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSending}
        className="btn-roast font-display rounded-full px-[30px] py-[15px] text-base leading-none font-medium tracking-[0.32px]"
      >
        {isSending ? "Sending…" : "Send sign-in link"}
      </button>
    </form>
  );
}

function CheckEmail({ email, onReset }: { email: string; onReset: () => void }) {
  return (
    // role="status" — программы чтения экрана сами прочитают это сообщение
    <div role="status" className="flex flex-col gap-5">
      <h2 className="font-display text-[28px] leading-[1.2] font-medium tracking-[-0.36px] text-accent md:text-4xl">
        Check your email
      </h2>
      <p className="text-lg leading-[1.4] font-medium text-black/70">
        We sent a sign-in link to <span className="break-all text-black">{email}</span>. Tap it to
        sign in.
      </p>

      <ul className="flex flex-col gap-3 rounded-lg bg-bark/5 p-5 text-base leading-[1.4] font-medium text-black/70">
        <li>
          <span className="text-black">Can’t find it?</span> Check your spam or promotions folder —
          the email comes from Supabase, our sign-in service.
        </li>
        <li>
          <span className="text-black">Open the link in this browser.</span> If you open it on
          another device or browser, you’ll be signed in there instead.
        </li>
        <li>
          <span className="text-black">The link works once</span> and expires in an hour.
        </li>
      </ul>

      <button
        type="button"
        onClick={onReset}
        className="self-start text-base font-medium text-black/60 underline-offset-4 transition-colors hover:text-black hover:underline"
      >
        Use a different email or send again
      </button>
    </div>
  );
}
