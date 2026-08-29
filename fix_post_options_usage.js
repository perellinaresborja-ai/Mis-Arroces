const fs = require('fs');

let feed = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');
feed = feed.replace(
  /<PostOptionsMenu \n\s*entityType=\{entityType\} \n\s*entityId=\{entityId\} \n\s*allowComments=\{true\} \n\s*\/>/g,
  `<PostOptionsMenu 
              entityType={entityType} 
              entityId={entityId} 
              allowComments={true} 
              hidePin={true}
            />`
);

// also catch any single line 
feed = feed.replace(
  /<PostOptionsMenu entityType=\{entityType\} entityId=\{entityId\} allowComments=\{true\} \/>/g,
  `<PostOptionsMenu entityType={entityType} entityId={entityId} allowComments={true} hidePin={true} />`
);

fs.writeFileSync('src/components/domain/FeedCard.tsx', feed);
console.log('Fixed FeedCard.tsx');

let comments = fs.readFileSync('src/components/domain/CommentsModal.tsx', 'utf8');
comments = comments.replace(
  /<PostOptionsMenu entityType=\{entityType\} entityId=\{entityId\} allowComments=\{allowComments\} onDeleted=\{onClose\} \/>/g,
  `<PostOptionsMenu entityType={entityType} entityId={entityId} allowComments={allowComments} onDeleted={onClose} hidePin={true} />`
);
fs.writeFileSync('src/components/domain/CommentsModal.tsx', comments);
console.log('Fixed CommentsModal.tsx');
