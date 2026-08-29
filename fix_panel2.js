const fs = require('fs');

let code = fs.readFileSync('src/components/domain/NotificationPanel.tsx', 'utf8');

code = code.replace(
  /\/\/ Routing logic([\s\S]*?)onClose\(\)/,
  `// Routing logic
    if (notif.type === 'NEW_MESSAGE') { router.push(\`/messages/\${notif.payload?.conversation_id}\`); }
    else if (notif.type === 'FOLLOW' || notif.type === 'FOLLOW_ACCEPT') {
      const url = notif.actor?.username ? \`/@\${notif.actor.username}\` : \`/\${notif.actor?.id}\`;
      router.push(url);
    } else if (notif.type === 'FOLLOW_REQUEST') {
      router.push(\`/profile/requests\`)
    } else if (notif.type === 'LIKE' || notif.type === 'COMMENT' || notif.type === 'REPLY' || notif.type === 'MENTION' || notif.type === 'TAG' || notif.type === 'REACTION') {
      if (notif.entity_type === 'recipe') router.push(\`/recipes/\${notif.entity_id}\`)
      else if (notif.entity_type === 'session') router.push(\`/sessions/\${notif.entity_id}\`)
      else if (notif.entity_type === 'post') router.push(\`/posts/\${notif.entity_id}\`)
      else if (notif.entity_type === 'short') router.push(\`/shorts\`)
      else if (notif.entity_type === 'story') {
        const url = notif.actor?.username ? \`/@\${notif.actor.username}\` : \`/\${notif.actor?.id}\`;
        router.push(url);
      }
    } else if (notif.type === 'COOKED_RECIPE') {
      router.push(\`/sessions/\${notif.entity_id}\`)
    }

    onClose()`
);

fs.writeFileSync('src/components/domain/NotificationPanel.tsx', code);
console.log('Fixed NotificationPanel routes logic');
