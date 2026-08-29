const fs = require('fs');

let actions = fs.readFileSync('src/app/actions/stories.ts', 'utf8');

// Replace votePoll
const votePollRegex = /export async function votePoll[\s\S]*?(?=export async function submitQuestionReply)/;
const newVotePoll = `export async function votePoll(storyId: string, pollId: string, option: 'A'|'B') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check blocks
  const { data: story } = await supabase.from('stories').select('owner_id, expires_at').eq('id', storyId).single();
  if (!story) throw new Error("Story not found");
  
  if (new Date(story.expires_at) < new Date()) {
    throw new Error("Story expired");
  }

  const { data: isBlocked } = await supabase.rpc('is_blocked', { uid1: user.id, uid2: story.owner_id });
  if (isBlocked) throw new Error("Action denied");

  const { error } = await supabase.from('story_poll_votes').insert({
    poll_id: pollId,
    user_id: user.id,
    selected_option: option
  });

  if (error) {
    if (error.code === '23505') throw new Error("Ya has votado en esta encuesta");
    throw error;
  }
  
  return true;
}

export async function getPollResults(pollId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: votes, error } = await supabase.from('story_poll_votes').select('selected_option, user_id').eq('poll_id', pollId);
  if (error) throw error;
  
  let countA = 0;
  let countB = 0;
  let myVote = null;
  
  votes.forEach(v => {
    if (v.selected_option === 'A') countA++;
    if (v.selected_option === 'B') countB++;
    if (user && v.user_id === user.id) myVote = v.selected_option;
  });
  
  const total = countA + countB;
  return {
    countA,
    countB,
    total,
    percentA: total > 0 ? Math.round((countA / total) * 100) : 0,
    percentB: total > 0 ? Math.round((countB / total) * 100) : 0,
    myVote
  };
}

export async function publishPoll(storyId: string, pollId: string, question: string, optionA: string, optionB: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  
  const { error } = await supabase.from('story_polls').insert({
    id: pollId,
    story_id: storyId,
    question,
    option_a: optionA,
    option_b: optionB
  });
  if (error) throw error;
}

`;

actions = actions.replace(votePollRegex, newVotePoll);
fs.writeFileSync('src/app/actions/stories.ts', actions);
console.log('Patched actions');
