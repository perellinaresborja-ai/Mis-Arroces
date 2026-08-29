const fs = require('fs');

let actions = fs.readFileSync('src/app/actions/stories.ts', 'utf8');

const submitQRegex = /export async function submitQuestionReply[\s\S]*?\n  \}/;
const newSubmitQ = `export async function submitQuestionReply(storyId: string, ownerId: string, question: string, answer: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check story existence and rules
  const { data: story } = await supabase.from('stories').select('owner_id, expires_at, allow_replies').eq('id', storyId).single();
  if (!story) throw new Error("Story not found");
  
  if (new Date(story.expires_at) < new Date()) {
    throw new Error("Story expirada");
  }

  if (!story.allow_replies) {
    throw new Error("Las respuestas están desactivadas para esta historia");
  }

  const { data: isBlocked } = await supabase.rpc('is_blocked', { uid1: user.id, uid2: story.owner_id });
  if (isBlocked) throw new Error("Action denied");

  const { getOrCreateConversation, sendMessage } = await import('@/app/actions/messaging');
  const conv = await getOrCreateConversation(ownerId);
  
  await sendMessage({
    conversationId: conv.id,
    type: 'STORY',
    body: \`Respondida a pregunta: "\${question}"\\n\\n\${answer}\`,
    entityId: storyId
  });

  return true;
}`;

actions = actions.replace(submitQRegex, newSubmitQ);
fs.writeFileSync('src/app/actions/stories.ts', actions);
console.log('Patched submitQuestionReply');
