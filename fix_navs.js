const fs = require('fs');

let bottomNav = fs.readFileSync('src/components/domain/BottomNav.tsx', 'utf8');

// Inject Messages into navItems
if (!bottomNav.includes('"/messages"')) {
  bottomNav = bottomNav.replace(
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
  
  // Actually we need the UnreadBadge to show up! 
  // Wait, the icons are dynamically mapped! It just maps `Icon` to `item.icon`.
  // To have a badge over MessageCircle, we'd need to modify the map function:
  
  bottomNav = bottomNav.replace(
    /<Icon\s*className="h-6 w-6"\s*strokeWidth=\{isActive \? 2\.5 : 2\}\s*\/>/g,
    `<Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                {item.href === '/messages' && <UnreadBadge />}`
  );
  
  if (!bottomNav.includes('UnreadBadge')) {
    bottomNav = `import { UnreadBadge } from "@/components/domain/messages/UnreadBadge"\n` + bottomNav;
  }
  
  fs.writeFileSync('src/components/domain/BottomNav.tsx', bottomNav);
}

let desktopNav = fs.readFileSync('src/components/domain/DesktopNav.tsx', 'utf8');
if (!desktopNav.includes('"/messages"')) {
  // DesktopNav doesn't use map? Let's check.
  if (desktopNav.includes('<Link href="/profile"')) {
     desktopNav = desktopNav.replace(/<Link href="\/profile"/, 
     `<Link href="/messages" className={\`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors \${pathname === '/messages' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}\`}>
        <div className="relative">
          <MessageCircle className="w-5 h-5" />
          <UnreadBadge />
        </div>
        Mensajes
      </Link>
      <Link href="/profile"`);
      
      if (!desktopNav.includes('UnreadBadge')) {
        desktopNav = `import { UnreadBadge } from "@/components/domain/messages/UnreadBadge"\n` + desktopNav;
      }
      fs.writeFileSync('src/components/domain/DesktopNav.tsx', desktopNav);
  } else if (desktopNav.includes('<Link href="/me"')) {
      desktopNav = desktopNav.replace(/<Link href="\/me"/, 
      `<Link href="/messages" className={\`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors \${pathname === '/messages' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}\`}>
        <div className="relative">
          <MessageCircle className="w-5 h-5" />
          <UnreadBadge />
        </div>
        Mensajes
      </Link>
      <Link href="/me"`);
      if (!desktopNav.includes('UnreadBadge')) {
        desktopNav = `import { UnreadBadge } from "@/components/domain/messages/UnreadBadge"\n` + desktopNav;
      }
      fs.writeFileSync('src/components/domain/DesktopNav.tsx', desktopNav);
  }
}

console.log('Navs fixed properly');
