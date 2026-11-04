// Поле формы в стиле сайта: подпись сверху, поле, под ним ошибка (если есть).
export const inputClass =
  "h-[50px] w-full rounded-lg border border-black/20 bg-transparent px-[13px] text-lg font-medium text-black placeholder:text-black/40 focus:border-bark focus:outline-none aria-invalid:border-accent";

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="font-display pl-2.5 text-lg font-medium text-black/80">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="pl-2.5 text-sm font-medium text-accent">
          {error}
        </p>
      ) : (
        hint && <p className="pl-2.5 text-sm font-medium text-black/50">{hint}</p>
      )}
    </div>
  );
}
