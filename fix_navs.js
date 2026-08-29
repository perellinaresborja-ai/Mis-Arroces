const fs = require('fs');

let desktop = fs.readFileSync('src/components/domain/DesktopNav.tsx', 'utf8');
desktop = desktop.replace(
  /<MediaImage src=\{avatarUrl\} alt="Perfil" className="w-full h-full object-cover" fill=\{true\} \/>/,
  '<MediaImage src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" fill={true} unoptimized={true} />'
);
fs.writeFileSync('src/components/domain/DesktopNav.tsx', desktop);

let bottom = fs.readFileSync('src/components/domain/BottomNav.tsx', 'utf8');
bottom = bottom.replace(
  /<MediaImage src=\{avatarUrl\} alt="Perfil" className="w-full h-full object-cover" fill=\{true\} \/>/,
  '<MediaImage src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" fill={true} unoptimized={true} />'
);
fs.writeFileSync('src/components/domain/BottomNav.tsx', bottom);

console.log('Fixed navs');
