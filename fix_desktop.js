const fs = require('fs');

let code = fs.readFileSync('src/components/domain/DesktopNav.tsx', 'utf8');
code = code.replace('{ href: "/me", icon: User, label: "Perfil" },', '{ href: "/messages", icon: MessageCircle, label: "Mensajes" },\n    { href: "/me", icon: User, label: "Perfil" },');
code = code.replace('<Icon className="w-5 h-5" />', '<div className="relative"><Icon className="w-5 h-5" />{item.href === "/messages" && <UnreadBadge />}</div>');
fs.writeFileSync('src/components/domain/DesktopNav.tsx', code);
