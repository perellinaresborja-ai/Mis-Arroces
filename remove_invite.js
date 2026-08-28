const fs = require('fs');
let code = fs.readFileSync('src/app/[userParam]/page.tsx', 'utf8');

// Remove import
code = code.replace(/import \{ InviteButton \} from "@\/components\/domain\/InviteButton"\n/, '');

// Remove tag
code = code.replace(/<InviteButton inviteCode=\{profile\.invite_code\} \/>\n/, '');

fs.writeFileSync('src/app/[userParam]/page.tsx', code);
console.log("REMOVED INVITE BUTTON");
