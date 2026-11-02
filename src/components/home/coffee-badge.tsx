import Image from "next/image";

// Круглый значок «Daily coffee rituals» из Figma (Group 1 / Frame 19951).
// Надпись по кругу медленно вращается по часовой стрелке, а зерно в центре — в обратную сторону.
// Текст по кругу рисуем в SVG через textPath — буквы сами встают по окружности.
// Положение значка (absolute, top/left…) задаёт тот, кто его использует, через className.
export function CoffeeBadge({ className = "relative" }: { className?: string }) {
  return (
    <div className={`size-[178px] ${className}`} aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-[2px]" />

      <svg viewBox="0 0 178 178" className="animate-spin-slow absolute inset-0 size-full">
        <defs>
          <path id="badge-circle" d="M89,89 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
        </defs>
        <text className="fill-black/70 text-[15px] font-medium uppercase">
          {/* textLength растягивает надпись ровно на длину окружности (2 × π × 72 ≈ 452) */}
          <textPath href="#badge-circle" startOffset="0" textLength="448" lengthAdjust="spacing">
            Daily coffee rituals ♥ Daily coffee rituals ♥
          </textPath>
        </text>
      </svg>

      <Image
        src="/images/logo-bean.png"
        alt=""
        width={87}
        height={109}
        className="animate-spin-slow-reverse absolute top-[41px] left-[51px] h-[96px] w-[77px] object-contain"
      />
    </div>
  );
}
