const fs = require('fs');

let f = fs.readFileSync('src/app/page.tsx', 'utf8');
if (!f.includes('import { StoriesBar }')) {
  f = f.replace(
    'import { FeedList } from "@/components/domain/FeedList"',
    'import { FeedList } from "@/components/domain/FeedList"\nimport { StoriesBar } from "@/components/domain/StoriesBar"\nimport { fetchActiveStories } from "@/app/actions/stories"'
  );
  fs.writeFileSync('src/app/page.tsx', f, 'utf8');
}
