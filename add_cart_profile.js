const fs = require('fs');
let profile = fs.readFileSync('src/app/[userParam]/page.tsx', 'utf8');

const target = `<InviteButton inviteCode={profile.invite_code} />
                  <Link href="/settings"`;

const replacement = `<Link href="/shopping-list" className="flex items-center justify-center w-10 h-10 bg-black/60 rounded-full hover:bg-black transition text-white backdrop-blur-sm shadow-sm" title="Lista de la compra">
                    <ShoppingCart className="w-5 h-5" />
                  </Link>
                  <InviteButton inviteCode={profile.invite_code} />
                  <Link href="/settings"`;

if (profile.includes(target)) {
  profile = profile.replace(target, replacement);
}

// Add ShoppingCart import if not there
if (!profile.includes('ShoppingCart')) {
  profile = profile.replace('Settings, Lock, User, Grid, Clapperboard, UserSquare, LinkIcon', 'Settings, Lock, User, Grid, Clapperboard, UserSquare, LinkIcon, ShoppingCart');
}

fs.writeFileSync('src/app/[userParam]/page.tsx', profile, 'utf8');
