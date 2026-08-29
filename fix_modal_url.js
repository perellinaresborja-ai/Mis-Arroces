const fs = require('fs');

let code = fs.readFileSync('src/components/domain/AddToHighlightModal.tsx', 'utf8');

code = code.replace(
  /"https:\/\/zvesoygqssyyojqyswwm\.supabase\.co\/storage\/v1\/object\/public\/story_media\/" \+ h\.cover_url/,
  `"https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/" + h.cover_url`
);

code = code.replace(
  /const url = notif\.actor\?\.username \? `\/@\$\{notif\.actor\.username\}` : `\/\$\{notif\.actor\?\.id\}`;/,
  `const url = notif.actor?.username ? \`/@\${notif.actor.username}\` : \`/\${notif.actor?.id}\`;`
); // random replacement ignore

fs.writeFileSync('src/components/domain/AddToHighlightModal.tsx', code);
console.log('Fixed AddToHighlightModal image url');
