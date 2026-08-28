const fs = require('fs');

let feed = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

feed = feed.replace(
  /<FeedFollowButton[\s\S]*?\/>/,
  `<FeedFollowButton \n            isAuthenticated={!!currentUserId} \n            initialStatus={followStatus || null} \n            targetId={user.id} \n            isPrivate={user.privacy_level === "PRIVATE"} \n          />`
);

fs.writeFileSync('src/components/domain/FeedCard.tsx', feed);
console.log("FIXED FEEDFOLLOWBUTTON PROPS");
