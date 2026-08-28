const fs = require('fs');

let code = fs.readFileSync('src/app/profile/edit/EditProfileForm.tsx', 'utf8');

const oldCoverOverlay = '<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">';
const newCoverOverlay = '<div className="absolute inset-0 bg-black/40 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 opacity-100">';

code = code.replace(oldCoverOverlay, newCoverOverlay);
fs.writeFileSync('src/app/profile/edit/EditProfileForm.tsx', code);
