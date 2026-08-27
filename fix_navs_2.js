const fs = require('fs');
let desktopNav = fs.readFileSync('src/components/domain/DesktopNav.tsx', 'utf8');

if (!desktopNav.includes('"/messages"')) {
  desktopNav = desktopNav.replace(
    /href: "\/me",\s*icon: User,\s*label: "Perfil",\s*\},/g,
    `href: "/messages",
      icon: MessageCircle,
      label: "Mensajes",
    },
    {
      href: "/me",
      icon: User,
      label: "Perfil",
    },`
  );

  desktopNav = desktopNav.replace(
    /<Icon className="w-5 h-5" \/>/g,
    `<Icon className="w-5 h-5" />\n              {item.href === '/messages' && <UnreadBadge />}`
  );
  
  if (!desktopNav.includes('UnreadBadge')) {
    desktopNav = `import { UnreadBadge } from "@/components/domain/messages/UnreadBadge"\n` + desktopNav;
  }
  
  fs.writeFileSync('src/components/domain/DesktopNav.tsx', desktopNav);
}
console.log('Fixed Desktop Nav');
