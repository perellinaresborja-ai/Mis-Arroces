import Link from "next/link"

interface RecipeFeedPlaceholderProps {
  href: string
  recipeName?: string
}

export function RecipeFeedPlaceholder({ href, recipeName }: RecipeFeedPlaceholderProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-border/50">
      <Link
        href={href}
        aria-label={recipeName ? `Ver receta: ${recipeName}` : "Ver receta"}
        className="group relative w-full aspect-square md:aspect-[4/3] bg-[#FAF8F5] dark:bg-card/50 flex flex-col items-center justify-center p-6 text-center select-none transition-colors hover:bg-[#F4F1EA] dark:hover:bg-card/70"
      >
        {/* Ilustración SVG paella y arroz en negro y naranja */}
        <div className="relative flex items-center justify-center">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-24 h-24 sm:w-28 sm:h-28 transition-transform duration-300 group-hover:scale-105"
            aria-hidden="true"
          >
            {/* Halo sutil de fondo */}
            <circle cx="60" cy="60" r="50" fill="#EA580C" fillOpacity="0.06" />

            {/* Granos de arroz flotantes */}
            <path d="M46 30C46 30 49 25 53 27C57 29 55 35 51 34C47 33 46 30 46 30Z" fill="#EA580C" />
            <path d="M69 26C69 26 73 23 76 26C79 29 76 34 72 32C68 30 69 26 69 26Z" fill="#EA580C" />
            <path d="M59 20C59 20 62 16 66 18C70 20 68 25 64 24C60 23 59 20 59 20Z" fill="#EA580C" fillOpacity="0.75" />

            {/* Asa izquierda de paella */}
            <path
              d="M23 65C16 65 13 58 19 52C23 48 27 51 29 53"
              stroke="#18181B"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Asa derecha de paella */}
            <path
              d="M97 65C104 65 107 58 101 52C97 48 93 51 91 53"
              stroke="#18181B"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Cuerpo y base de la paella */}
            <ellipse cx="60" cy="67" rx="36" ry="16" fill="#FFFFFF" stroke="#18181B" strokeWidth="3" />
            <ellipse cx="60" cy="67" rx="28" ry="11" fill="#FAF5ED" stroke="#EA580C" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Granos de arroz estilizados en el fondo */}
            <ellipse cx="52" cy="66" rx="3.5" ry="1.8" transform="rotate(-15 52 66)" fill="#EA580C" />
            <ellipse cx="64" cy="65" rx="3.5" ry="1.8" transform="rotate(25 64 65)" fill="#EA580C" />
            <ellipse cx="58" cy="70" rx="3.2" ry="1.6" transform="rotate(-5 58 70)" fill="#18181B" />
            <ellipse cx="69" cy="69" rx="3" ry="1.5" transform="rotate(-30 69 69)" fill="#EA580C" fillOpacity="0.85" />
            <ellipse cx="45" cy="68" rx="2.8" ry="1.4" transform="rotate(35 45 68)" fill="#EA580C" fillOpacity="0.85" />

            {/* Vapores suaves de cocción */}
            <path
              d="M51 47C49 42 53 39 51 35"
              stroke="#EA580C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.55"
            />
            <path
              d="M60 45C58 40 62 37 60 33"
              stroke="#EA580C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.8"
            />
            <path
              d="M69 47C67 42 71 39 69 35"
              stroke="#EA580C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.55"
            />
          </svg>
        </div>

        {/* Indicador discreto de placeholder de receta */}
        <div className="flex flex-col items-center mt-3 gap-1">
          <span className="text-[11px] font-semibold text-muted-foreground/80 tracking-wider uppercase bg-[#EFECE5] dark:bg-muted/60 px-2.5 py-0.5 rounded-full border border-border/40">
            Receta sin foto
          </span>
          <span className="text-[12px] text-muted-foreground/60 font-semibold tracking-wide">
            mis<span className="text-[#EA580C] font-bold">arroces</span>
          </span>
        </div>
      </Link>
    </div>
  )
}
