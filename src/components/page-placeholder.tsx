// Временная заготовка страницы: показывает заголовок и этап, на котором её сделаем.
export function PagePlaceholder({ title, stage }: { title: string; stage: number }) {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-[1440px] flex-col justify-center px-4 pt-32 pb-20 md:px-10">
      <h1 className="font-display text-4xl leading-[1.2] font-medium tracking-[-1px] md:text-[80px]">
        {title}
      </h1>
      <p className="mt-4 text-lg leading-[1.4] font-medium text-black/60">
        Coming soon — stage {stage}.
      </p>
    </section>
  );
}
