const fs = require('fs');
let code = fs.readFileSync('src/app/actions/social.ts', 'utf8');

const newListAction = `
export async function getFollowsList(targetUserId: string, type: 'followers' | 'following') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase.from('follows').select(type === 'followers' 
    ? 'follower:profiles!follows_follower_id_fkey(id, username, display_name, privacy_level, avatar:media_assets!fk_profiles_avatar(storage_path))' 
    : 'following:profiles!follows_following_id_fkey(id, username, display_name, privacy_level, avatar:media_assets!fk_profiles_avatar(storage_path))'
  ).eq('status', 'ACCEPTED');

  if (type === 'followers') query = query.eq('following_id', targetUserId);
  else query = query.eq('follower_id', targetUserId);

  const { data } = await query;
  if (!data) return [];

  const profiles = data.map((d: any) => d.follower || d.following).filter(Boolean);

  if (!user) return profiles.map((p: any) => ({ ...p, followStatus: null }));

  const profileIds = profiles.map((p: any) => p.id);
  
  if (profileIds.length === 0) return [];

  const { data: myFollows } = await supabase.from('follows').select('following_id, status').eq('follower_id', user.id).in('following_id', profileIds);
  
  const followMap = myFollows?.reduce((acc: any, f: any) => { acc[f.following_id] = f.status; return acc; }, {}) || {};

  return profiles.map((p: any) => ({
    ...p,
    followStatus: followMap[p.id] || null
  }));
}
`;

if (!code.includes('export async function getFollowsList')) {
    code += newListAction;
    fs.writeFileSync('src/app/actions/social.ts', code);
    console.log("ADDED ACTION");
}
