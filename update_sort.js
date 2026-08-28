const fs = require('fs');

let page = fs.readFileSync('src/app/[userParam]/page.tsx', 'utf8');

// Replace sort logic
page = page.replace(
  /feedItems = \[\.\.\.recipes, \.\.\.sessions, \.\.\.posts\]\.sort\(\(a, b\) => b\.sort_date - a\.sort_date\)/,
  `feedItems = [...recipes, ...sessions, ...posts].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return b.sort_date - a.sort_date;
    })`
);

fs.writeFileSync('src/app/[userParam]/page.tsx', page);
console.log("UPDATED Profile page sort");
