const fs = require('fs');

let actions = `
export async function votePoll(storyId: string, pollId: string, option: 'A'|'B') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  
  // Real implementation would upsert into story_interactions or story_poll_votes
  // Since we are not creating tables, we will use analytics_events as a polyfill if needed,
  // or story_reactions if it exists.
  const { error } = await supabase.from('story_reactions').upsert({
    story_id: storyId,
    user_id: user.id,
    reaction_type: 'POLL_' + pollId,
    metadata: { option }
  })
  if (error) console.error(error)
}

export async function submitQuestionReply(storyId: string, ownerId: string, question: string, answer: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  
  // Create conversation or use existing
  let { data: convs } = await supabase.rpc('get_conversation_with_user', { other_user_id: ownerId })
  let conversationId = convs?.[0]?.id

  if (!conversationId) {
    const { data: newConv } = await supabase.from('conversations').insert({}).select().single()
    if (newConv) {
      conversationId = newConv.id
      await supabase.from('conversation_members').insert([
        { conversation_id: conversationId, user_id: user.id },
        { conversation_id: conversationId, user_id: ownerId }
      ])
    }
  }

  if (conversationId) {
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: \`Respuesta a tu pregunta "\${question}": \${answer}\`,
      message_type: 'STORY_REPLY',
      metadata: { story_id: storyId }
    })
  }
}
`;

let code = fs.readFileSync('src/app/actions/stories.ts', 'utf8');
code += "\n" + actions;
fs.writeFileSync('src/app/actions/stories.ts', code);
