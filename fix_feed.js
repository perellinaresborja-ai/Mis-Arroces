const fs = require('fs');
let content = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

const startIdx = content.indexOf('export function FeedCard({');
const endIdx = content.indexOf('  const [commentsOpen', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const newDecl = `export function FeedCard({
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
}: FeedCardProps) {
  const user = initialUser || { username: 'usuario_desconocido', display_name: 'Usuario Desconocido', avatar: null };
`;
  content = content.substring(0, startIdx) + newDecl + content.substring(endIdx);
  fs.writeFileSync('src/components/domain/FeedCard.tsx', content, 'utf8');
}
