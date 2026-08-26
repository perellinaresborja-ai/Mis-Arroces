const fs = require('fs');
let content = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

const regex = /export function FeedCard\(\{[\s\S]*?\}: FeedCardProps\) \{[\s\S]*?\}: FeedCardProps\) \{/m;
const replacement = `export function FeedCard({
  entityType,
  entityId,
  user: initialUser,
  createdAt,
  likeCount,
  isLiked,
  commentCount,
  currentUserId,
  postContent,
  recipeName,
  recipeType,
  sessionRating,
  sessionSocarrat,
  linkedRecipe,
  media
}: FeedCardProps) {`;

content = content.replace(regex, replacement);

// And we also need to make sure 'user' is declared right after.
const userLine = `\n  const user = initialUser || { username: 'usuario_desconocido', display_name: 'Usuario Desconocido', avatar: null };\n`;
if (!content.includes("const user = initialUser")) {
  content = content.replace('  const [isCommentsOpen', userLine + '  const [isCommentsOpen');
}

fs.writeFileSync('src/components/domain/FeedCard.tsx', content, 'utf8');
