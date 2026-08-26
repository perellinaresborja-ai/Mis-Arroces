const fs = require('fs');

let file = fs.readFileSync('src/app/page.tsx', 'utf8');

file = file.replace(
  '<StoriesBar groupedStories={activeStories} currentUser={user} />',
  '{user && <StoriesBar groupedStories={activeStories} currentUser={user} />}'
);

fs.writeFileSync('src/app/page.tsx', file, 'utf8');
