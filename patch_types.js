const fs = require('fs');
let c = fs.readFileSync('src/types/database.types.ts', 'utf8');

if (!c.includes('grouped_reactions')) {
  // Patch feed_metrics
  c = c.replace(
    /feed_metrics: \{\s*Row: \{([\s\S]*?)\}\s*Insert:/,
    (match, p1) => {
      let add = '          grouped_reactions: Json | null\n          current_user_reaction: string | null\n        ';
      return 'feed_metrics: {\n        Row: {' + p1 + add + '}\n        Insert:';
    }
  );
}

const tableLikes = ['post_likes', 'recipe_likes', 'session_likes', 'short_likes', 'recipe_comment_likes', 'session_comment_likes'];
tableLikes.forEach(table => {
  const regex = new RegExp(table + ': \\{\\s*Row: \\{([\\\\s\\\\S]*?)\\}\\s*Insert: \\{([\\\\s\\\\S]*?)\\}\\s*Update: \\{([\\\\s\\\\S]*?)\\}', 'g');
  c = c.replace(regex, (match, row, ins, up) => {
    if (!row.includes('emoji: string')) {
      row = row + '          emoji: string\n        ';
      ins = ins + '          emoji?: string\n        ';
      up = up + '          emoji?: string\n        ';
    }
    return table + ': {\n        Row: {' + row + '}\n        Insert: {' + ins + '}\n        Update: {' + up + '}';
  });
});

fs.writeFileSync('src/types/database.types.ts', c);
console.log('Patched database.types.ts');

