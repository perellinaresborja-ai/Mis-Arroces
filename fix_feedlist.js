const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FeedList.tsx', 'utf8');

// There are three places FeedCard is rendered (post, recipe, session).
// They all have \`currentUserId={currentUserId}\`
code = code.replace(
  /currentUserId=\{currentUserId\}/g,
  `currentUserId={currentUserId}\n              followStatus={(item as any).followStatus}`
);

fs.writeFileSync('src/components/domain/FeedList.tsx', code);
