const fs = require('fs');

let social = fs.readFileSync('src/components/domain/SocialElaborationModal.tsx', 'utf8');
social = social.replace(/const isOwner = currentUserId && item\.author\?\.id === currentUserId/g, `const isOwner = true; // DEBUG FORCED`);
fs.writeFileSync('src/components/domain/SocialElaborationModal.tsx', social);
console.log("FORCED isOwner IN SOCIAL MODAL");
