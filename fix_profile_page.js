const fs = require('fs');

let code = fs.readFileSync('src/app/[userParam]/page.tsx', 'utf8');

// 1. Extract followStatus and canViewPrivate logic
const followStatusLogic = `
  let followStatus = null
  if (user && !isSelf) {
    const { data: follow } = await supabase.from("follows").select("status").match({ follower_id: user.id, following_id: profile.id }).single()
    if (follow) followStatus = follow.status
  }

  const canViewPrivate = isSelf || (profile.privacy_level === "PUBLIC") || (followStatus === "ACCEPTED")
  const visibilityFilter = isSelf ? ["PUBLIC", "PRIVATE", "FOLLOWERS"] : ["PUBLIC", "FOLLOWERS"]
`;

// 2. Remove it from its current location
code = code.replace(followStatusLogic, '');

// 3. Insert it right below `const isSelf = user?.id === profile.id`
code = code.replace(
  'const isSelf = user?.id === profile.id',
  `const isSelf = user?.id === profile.id\n${followStatusLogic}`
);

fs.writeFileSync('src/app/[userParam]/page.tsx', code);
console.log('Fixed ReferenceError in ProfilePage');
