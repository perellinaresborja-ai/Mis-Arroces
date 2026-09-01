const fs = require('fs');
try {
  const cp = require('child_process');
  const files = cp.execSync('git grep -l LikeButton src/').toString().trim().split('\n');
  files.forEach(file => {
    if (!file) return;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/LikeButton/g, 'ReactionButton');
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  });
} catch(e) {
  console.log(e.message);
}

