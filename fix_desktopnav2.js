const fs = require('fs');
let code = fs.readFileSync('src/components/domain/DesktopNav.tsx', 'utf8');

const regex = /<Icon className="h-4 w-4" \/>/g;

const newRender = `{(item as any).isAvatar && avatarUrl ? (
                  <div className={cn(
                    "w-6 h-6 rounded-full overflow-hidden border-2 flex items-center justify-center shrink-0",
                    isActive ? "border-primary" : "border-transparent"
                  )}>
                    <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <Icon className="h-4 w-4" />
                )}`;

if (regex.test(code)) {
    code = code.replace(regex, newRender);
    fs.writeFileSync('src/components/domain/DesktopNav.tsx', code);
    console.log("REPLACED ICON");
} else {
    console.log("NOT FOUND");
}
