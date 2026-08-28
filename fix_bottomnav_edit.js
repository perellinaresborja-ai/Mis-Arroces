const fs = require('fs');

let code = fs.readFileSync('src/components/domain/BottomNav.tsx', 'utf8');

const oldCheck = 'if (pathname === "/login" || pathname === "/forgot-password") return null;';
const newCheck = 'if (pathname === "/login" || pathname === "/forgot-password" || pathname.includes("/edit") || pathname.includes("/create")) return null;';

code = code.replace(oldCheck, newCheck);

fs.writeFileSync('src/components/domain/BottomNav.tsx', code);
