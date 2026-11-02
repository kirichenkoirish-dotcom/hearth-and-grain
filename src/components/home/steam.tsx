// Анимированный пар над чашкой на первом экране.
// Четыре размытые светлые «струйки» по очереди поднимаются и тают.
// Пар на самом фото остаётся, а это — движение поверх него.
//
// Размеры и положение заданы в cqw — процентах от ширины блока с фото (container query).
// Фото всегда растянуто по ширине и прижато к низу, поэтому чашка находится
// на одном и том же расстоянии от нижнего края в «процентах ширины» — на любом экране.
const wisps = [
  { left: "10%", delay: "0s" },
  { left: "34%", delay: "1.75s" },
  { left: "55%", delay: "3.5s" },
  { left: "24%", delay: "5.25s" },
];

export function Steam() {
  return (
    <div
      aria-hidden="true"
      // mix-blend-screen — режим «осветления»: на тёмном фоне пар выглядит ярче и естественнее
      className="pointer-events-none absolute bottom-[72cqw] left-[37cqw] h-[44cqw] w-[29cqw] mix-blend-screen"
    >
      {wisps.map((wisp) => (
        <span
          key={wisp.delay}
          className="animate-steam absolute bottom-0 h-full w-[45%] rounded-full bg-[radial-gradient(ellipse_at_center,rgb(255_250_240/0.75),rgb(255_250_240/0.25)_45%,transparent_72%)] opacity-0 blur-[7px]"
          style={{ left: wisp.left, animationDelay: wisp.delay }}
        />
      ))}
    </div>
  );
}
