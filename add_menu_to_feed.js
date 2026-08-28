const fs = require('fs');

let feed = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

if (!feed.includes('import { PostOptionsMenu }')) {
  feed = feed.replace(/import \{ CommentsModal \} from "@\/components\/domain\/CommentsModal"/, `import { CommentsModal } from "@/components/domain/CommentsModal"\nimport { PostOptionsMenu } from "@/components/domain/PostOptionsMenu"`);
}

feed = feed.replace(
  /\{currentUserId !== user\.id && \(\s*<FeedFollowButton[\s\S]*?\/>\s*\)\}/,
  `{currentUserId !== user.id ? (\n          <FeedFollowButton \n            targetUserId={user.id} \n            initialStatus={followStatus} \n            isPrivate={user.privacy_level === "PRIVATE"} \n            currentUserId={currentUserId}\n          />\n        ) : (\n          <PostOptionsMenu \n            entityType={entityType} \n            entityId={entityId} \n            allowComments={true} \n          />\n        )}`
);

fs.writeFileSync('src/components/domain/FeedCard.tsx', feed);
console.log("ADDED POST OPTIONS MENU TO FEED CARD");
