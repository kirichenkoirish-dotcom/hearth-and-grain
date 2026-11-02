import Link from "next/link";

// Эту страницу Next.js показывает, если адрес не существует
// или если страница вызвала notFound() (например, нет такого блюда).
export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-[1440px] flex-col justify-center px-4 pt-32 pb-20 md:px-10">
      <p className="flex items-center gap-2.5 text-base leading-[37px] font-medium tracking-[0.32px] text-accent uppercase">
        <span aria-hidden="true" className="h-px w-[25px] bg-accent" />
        Error 404
      </p>
      <h1 className="font-display text-4xl leading-[1.2] font-medium tracking-[-1px] md:text-[80px]">
        This page isn’t on the menu
      </h1>
      <p className="mt-4 max-w-[520px] text-lg leading-[1.4] font-medium text-black/60">
        The link may be old, or the dish has been taken off the menu.
      </p>
      <Link
        href="/menu"
        className="btn-roast font-display mt-8 self-start rounded-full px-[30px] py-3 text-base leading-none font-medium tracking-[0.32px]"
      >
        Back to menu
      </Link>
    </section>
  );
}
