const fs = require('fs');

let nav = fs.readFileSync('src/components/domain/DesktopNav.tsx', 'utf8');

nav = nav.replace(
  /className=\{cn\(\n\s*"w-9 h-9 rounded-full overflow-hidden border-2 flex items-center justify-center shrink-0",\n\s*\(pathname === "\/me" \|\| pathname.startsWith\("\/me\/"\)\) \? "border-primary" : "border-transparent"\n\s*\)\}>\n\s*<MediaImage src=\{avatarUrl\} alt="Perfil" className="w-full h-full object-cover" fill=\{true\} unoptimized=\{true\} \/>/,
  `className={cn(
                  "relative w-9 h-9 rounded-full overflow-hidden border-2 flex items-center justify-center shrink-0",
                  (pathname === "/me" || pathname.startsWith("/me/")) ? "border-primary" : "border-transparent"
                )}>
                  <MediaImage src={avatarUrl} alt="Perfil" fallbackType="avatar" className="w-full h-full object-cover" fill={true} unoptimized={true} />`
);

fs.writeFileSync('src/components/domain/DesktopNav.tsx', nav);
console.log('Fixed DesktopNav');

let menu = fs.readFileSync('src/components/domain/GlobalCreateMenu.tsx', 'utf8');

menu = menu.replace(
  /className=\{cn\(\n\s*"w-9 h-9 rounded-full flex items-center justify-center transition-colors border-2 hover:opacity-80 shrink-0",\n\s*isOpen \? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"\n\s*\)\}/,
  `className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center transition-colors border-2 hover:opacity-80 shrink-0",
          "bg-primary text-primary-foreground border-primary"
        )}`
);

fs.writeFileSync('src/components/domain/GlobalCreateMenu.tsx', menu);
console.log('Fixed GlobalCreateMenu');
