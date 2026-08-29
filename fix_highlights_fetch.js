const fs = require('fs');

let code = fs.readFileSync('src/app/actions/highlights.ts', 'utf8');

code = code.replace(
  /\.select\('id, name, cover_url'\)/,
  `.select(\`
      id, name, cover_url,
      highlight_stories (
        story_id,
        display_order,
        stories (*, author:profiles!stories_owner_id_fkey(*), story_media(media_id, media:media_assets(storage_path)))
      )
    \`)`
);

// We also need to map the data to the format `ProfileHighlightsClient` expects: `stories` array sorted by display_order
code = code.replace(
  /return data;/,
  `return data.map(h => {
    const sortedHS = (h.highlight_stories || []).sort((a: any, b: any) => a.display_order - b.display_order);
    return {
      id: h.id,
      name: h.name,
      cover_url: h.cover_url,
      stories: sortedHS.map((hs: any) => hs.stories).filter(Boolean)
    };
  });`
);

fs.writeFileSync('src/app/actions/highlights.ts', code);
console.log('Fixed getProfileHighlights to include stories');
