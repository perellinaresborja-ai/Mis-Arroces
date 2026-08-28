const fs = require('fs');
let code = fs.readFileSync('src/app/actions/feed.ts', 'utf8');

// 1. Change the follows query to get all statuses, but keep followingIds logic for visibility
code = code.replace(
  `const { data: follows } = await supabase.from("follows").select("following_id").eq("follower_id", user.id).eq("status", "ACCEPTED")
    const followingIds = follows?.map(f => f.following_id) || []`,
  `const { data: follows } = await supabase.from("follows").select("following_id, status").eq("follower_id", user.id)
    const followingIds = follows?.filter(f => f.status === 'ACCEPTED').map(f => f.following_id) || []
    const followStatusMap = follows?.reduce((acc: any, f: any) => { acc[f.following_id] = f.status; return acc; }, {}) || {}`
);

// 2. Add privacy_level to author selects
code = code.replace(/username, display_name, avatar:media_assets/g, 'username, display_name, privacy_level, avatar:media_assets');

// 3. Add followStatus to the enriched items mapping
code = code.replace(
  /return \{ \.\.\.item, data, isLiked: (.*?), likeCount: (.*?), commentCount: (.*?) \}/g,
  'return { ...item, data, isLiked: $1, likeCount: $2, commentCount: $3, followStatus: typeof followStatusMap !== "undefined" ? followStatusMap[data.author?.id] || null : null }'
);

fs.writeFileSync('src/app/actions/feed.ts', code);
