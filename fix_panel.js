const fs = require('fs');

let code = fs.readFileSync('src/components/domain/NotificationPanel.tsx', 'utf8');

code = code.replace(
  /if \(notif\.type === 'NEW_MESSAGE'\) \{ router\.push\(`\/messages\/\$\{notif\.payload\?\.conversation_id\}`\); \}/,
  `if (notif.type === 'NEW_MESSAGE') { router.push(\`/messages/\${notif.payload?.conversation_id}\`); }`
);

code = code.replace(
  /else if \(notif\.type === 'FOLLOW' \|\| notif\.type === 'FOLLOW_ACCEPT'\) \{\n\s*router\.push\(`\/@\$\{notif\.actor\?\.username\}`\)\n\s*\}/,
  `else if (notif.type === 'FOLLOW' || notif.type === 'FOLLOW_ACCEPT') {
        const url = notif.actor?.username ? \`/@\${notif.actor.username}\` : \`/\${notif.actor?.id}\`;
        router.push(url);
      }`
);

code = code.replace(
  /else if \(notif\.type === 'LIKE' \|\| notif\.type === 'COMMENT' \|\| notif\.type === 'REPLY' \|\| notif\.type === 'MENTION' \|\| notif\.type === 'TAG'\) \{\n\s*if \(notif\.entity_type === 'recipe'\) router\.push\(`\/recipes\/\$\{notif\.entity_id\}`\)\n\s*else if \(notif\.entity_type === 'session'\) router\.push\(`\/sessions\/\$\{notif\.entity_id\}`\)\n\s*else if \(notif\.entity_type === 'post'\) router\.push\(`\/posts\/\$\{notif\.entity_id\}`\)\n\s*else if \(notif\.entity_type === 'short'\) router\.push\(`\/shorts`\)\n\s*\}/,
  `else if (notif.type === 'LIKE' || notif.type === 'COMMENT' || notif.type === 'REPLY' || notif.type === 'MENTION' || notif.type === 'TAG' || notif.type === 'REACTION') {
        if (notif.entity_type === 'recipe') router.push(\`/recipes/\${notif.entity_id}\`)
        else if (notif.entity_type === 'session') router.push(\`/sessions/\${notif.entity_id}\`)
        else if (notif.entity_type === 'post') router.push(\`/posts/\${notif.entity_id}\`) 
        else if (notif.entity_type === 'short') router.push(\`/shorts\`)
        else if (notif.entity_type === 'story') {
          const url = notif.actor?.username ? \`/@\${notif.actor.username}\` : \`/\${notif.actor?.id}\`;
          router.push(url);
        }
      }`
);

fs.writeFileSync('src/components/domain/NotificationPanel.tsx', code);
console.log('Fixed NotificationPanel routes');
