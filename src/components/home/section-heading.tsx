// Заголовок раздела главной: оранжевая чёрточка, название и подзаголовок справа.
// Белая линия под заголовком — как в макете.
export function SectionHeading({
  id,
  title,
  subtitle,
}: {
  id: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/80 pb-8 md:flex-row md:items-start md:justify-between md:gap-10 md:pb-12">
      <h2
        id={id}
        className="font-display flex shrink-0 items-center gap-5 text-[28px] leading-[1.2] font-medium tracking-[-0.36px] md:text-4xl"
      >
        <span aria-hidden="true" className="h-[3px] w-[30px] bg-accent" />
        {title}
      </h2>
      <p className="font-display max-w-[594px] text-lg leading-[1.2] font-medium tracking-[-0.24px] text-black/80 md:text-2xl">
        {subtitle}
      </p>
    </div>
  );
}
