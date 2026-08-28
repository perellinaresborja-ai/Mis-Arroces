const fs = require('fs');

// FeedCard
let feed = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');
feed = feed.replace(/isOwner=\{currentUserId === user\.id\}/g, `isOwner={true} /* DEBUG FORCING TO TRUE */`);
fs.writeFileSync('src/components/domain/FeedCard.tsx', feed);
console.log("FORCED isOwner IN FEEDCARD");

// SocialElaborationModal
let social = fs.readFileSync('src/components/domain/SocialElaborationModal.tsx', 'utf8');
social = social.replace(/const isOwner = currentUserId === item\.author\?\.id/g, `const isOwner = true; // DEBUG FORCED`);
fs.writeFileSync('src/components/domain/SocialElaborationModal.tsx', social);
console.log("FORCED isOwner IN SOCIAL MODAL");
