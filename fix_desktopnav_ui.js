const fs = require('fs');
let code = fs.readFileSync('src/components/domain/DesktopNav.tsx', 'utf8');

const regex = /\{\(item as any\)\.isAvatar && avatarUrl \? \([\s\S]*?\{item\.label\}/s;

const replacement = `{(item as any).isAvatar ? (
                  avatarUrl ? (
                    <div className={cn(
                      "w-8 h-8 rounded-full overflow-hidden border-2 flex items-center justify-center shrink-0",
                      isActive ? "border-primary" : "border-transparent"
                    )}>
                      <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className={cn(
                      "w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 border-2",
                      isActive ? "border-primary" : "border-transparent"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                  )
                ) : (
                  <>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </>
                )}`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/domain/DesktopNav.tsx', code);
    console.log("REPLACED DESKTOP NAV PROFILE UI");
} else {
    console.log("REGEX FAILED");
}
