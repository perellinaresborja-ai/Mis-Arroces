const fs = require('fs');
let code = fs.readFileSync('src/components/domain/DesktopNav.tsx', 'utf8');

// 1. Remove 'Perfil' from navItems
code = code.replace(
  /,\s*\{\s*href: "\/me",\s*icon: User,\s*label: "Perfil",\s*isAvatar: true\s*\}/,
  ''
);

// 2. Change the mapping to not check for isAvatar, since it's just sections now
const mapRegex = /\{\(item as any\)\.isAvatar \? \([\s\S]*?<\/>\s*\)\}/;
code = code.replace(mapRegex, `<>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </>`);

// 3. Move Perfil next to Campana
const rightSideRegex = /<div className="flex items-center pl-2 border-l border-border ml-2">\s*<NotificationBell \/>\s*<\/div>/;

const newRightSide = `<div className="flex items-center gap-4 pl-6 border-l border-border ml-2">
            <NotificationBell />
            <Link href="/me" className={cn("transition-colors hover:opacity-80", pathname === "/me" || pathname.startsWith("/me/") ? "opacity-100" : "opacity-80")}>
              {avatarUrl ? (
                <div className={cn(
                  "w-9 h-9 rounded-full overflow-hidden border-2 flex items-center justify-center shrink-0",
                  (pathname === "/me" || pathname.startsWith("/me/")) ? "border-primary" : "border-transparent"
                )}>
                  <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={cn(
                  "w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 border-2",
                  (pathname === "/me" || pathname.startsWith("/me/")) ? "border-primary" : "border-transparent"
                )}>
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </Link>
          </div>`;

code = code.replace(rightSideRegex, newRightSide);

fs.writeFileSync('src/components/domain/DesktopNav.tsx', code);
console.log("REORGANIZED DESKTOP NAV");
