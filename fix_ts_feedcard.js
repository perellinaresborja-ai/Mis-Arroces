const fs = require('fs');

let feed = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');
feed = feed.replace(/initialStatus=\{followStatus\}/g, `initialStatus={followStatus || null}`);
fs.writeFileSync('src/components/domain/FeedCard.tsx', feed);
console.log("FIXED TS ERROR IN FEED CARD");
