const fs = require('fs');

function updateNav(file) {
  let f = fs.readFileSync(file, 'utf8');
  if (!f.includes('ShoppingCart')) {
    f = f.replace(
      'import { BookOpen, Compass, User',
      'import { BookOpen, Compass, User, ShoppingCart'
    );
    if (!f.includes('ShoppingCart')) {
        f = f.replace(
            'import { BookOpen, Compass, User, PlusCircle, Home } from "lucide-react"',
            'import { BookOpen, Compass, User, PlusCircle, Home, ShoppingCart } from "lucide-react"'
        );
    }
    const navItem = `
    {
      href: "/shopping-list",
      icon: ShoppingCart,
      label: "Compra",
    },`;
    
    // Find navItems array
    f = f.replace(
      '{ href: "/cookbook", icon: BookOpen, label: "Recetario" },',
      '{ href: "/cookbook", icon: BookOpen, label: "Recetario" },' + navItem
    );
    f = f.replace(
      'label: "Recetario",\n    },',
      'label: "Recetario",\n    },' + navItem
    );
    fs.writeFileSync(file, f, 'utf8');
  }
}

updateNav('src/components/domain/BottomNav.tsx');
updateNav('src/components/domain/DesktopNav.tsx');
