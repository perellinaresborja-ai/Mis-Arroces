const fs = require('fs');
let f = fs.readFileSync('src/app/page.tsx', 'utf8');

// Inject import
if (!f.includes('StoriesBar')) {
  f = f.replace(
    'import { FeedCard } from "@/components/domain/FeedCard"',
    'import { FeedCard } from "@/components/domain/FeedCard"\nimport { StoriesBar } from "@/components/domain/StoriesBar"\nimport { fetchActiveStories } from "@/app/actions/stories"'
  );
  
  // Replace the mock fetch
  const mockRegex = /\/\/ Minimal Stories mock fetch[\s\S]*?stories = usersWithStories\n  \}/;
  f = f.replace(mockRegex, "const activeStories = await fetchActiveStories()");
  
  // Replace the render
  const renderRegex = /\{\/\* Stories Bar \*\/\}\n\s*\{user && \([\s\S]*?<\/div>\n\s*\)\}/;
  f = f.replace(renderRegex, "{/* Stories Bar */}\n          <StoriesBar groupedStories={activeStories} currentUser={user} />");
  
  fs.writeFileSync('src/app/page.tsx', f, 'utf8');
}
