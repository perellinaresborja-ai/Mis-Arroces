const fs = require('fs');
let file = fs.readFileSync('src/app/[userParam]/page.tsx', 'utf8');

if (!file.includes('/profile/insights')) {
  file = file.replace(
    'import { Settings, Lock, User, Grid, Clapperboard, UserSquare, LinkIcon, ShoppingCart } from "lucide-react"',
    'import { Settings, Lock, User, Grid, Clapperboard, UserSquare, LinkIcon, ShoppingCart, BarChart2 } from "lucide-react"'
  );
  
  const settingsBtn = `<Link href="/settings" className="flex items-center justify-center w-10 h-10 bg-black/60 rounded-full hover:bg-black transition text-white backdrop-blur-sm shadow-sm" title="ConfiguraciÃ³n">`;
  const insightsBtn = `<Link href="/profile/insights" className="flex items-center justify-center w-10 h-10 bg-black/60 rounded-full hover:bg-black transition text-white backdrop-blur-sm shadow-sm" title="Estadísticas">\n                    <BarChart2 className="w-5 h-5" />\n                  </Link>\n                  `;
  
  file = file.replace(settingsBtn, insightsBtn + settingsBtn);
  fs.writeFileSync('src/app/[userParam]/page.tsx', file, 'utf8');
}
