const fs = require('fs');
let code = fs.readFileSync('src/app/actions/feed.ts', 'utf8');

const regex = /const \{ data: follows \} = await supabase\.from\("follows"\)\.select\("following_id"\)\.eq\("follower_id", user\.id\)\.eq\("status", "ACCEPTED"\)\s*const followingIds = follows\?\.map\(f => f\.following_id\) \|\| \[\]/s;

const replacement = `const { data: follows } = await supabase.from("follows").select("following_id, status").eq("follower_id", user.id)
    const followingIds = follows?.filter(f => f.status === 'ACCEPTED').map(f => f.following_id) || []
    const followStatusMap = follows?.reduce((acc: any, f: any) => { acc[f.following_id] = f.status; return acc; }, {}) || {}`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/app/actions/feed.ts', code);
    console.log("REPLACED SUCCESSFULLY");
} else {
    console.log("REGEX FAILED");
    // let's do it manually just in case
    const parts = code.split('const { data: follows } = await supabase.from("follows").select("following_id").eq("follower_id", user.id).eq("status", "ACCEPTED")');
    if (parts.length > 1) {
        code = parts[0] + 'const { data: follows } = await supabase.from("follows").select("following_id, status").eq("follower_id", user.id)\n    const followStatusMap = follows?.reduce((acc: any, f: any) => { acc[f.following_id] = f.status; return acc; }, {}) || {}\n' + parts[1].replace('const followingIds = follows?.map(f => f.following_id) || []', 'const followingIds = follows?.filter((f: any) => f.status === "ACCEPTED").map((f: any) => f.following_id) || []');
        fs.writeFileSync('src/app/actions/feed.ts', code);
        console.log("MANUAL REPLACE SUCCESSFUL");
    }
}
