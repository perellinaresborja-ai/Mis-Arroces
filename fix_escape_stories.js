const fs = require('fs');
let f = fs.readFileSync('src/components/domain/StoriesBar.tsx', 'utf8');

// The file was written with write_to_file which escapes \` if passed directly without being careful, wait, I used \` inside the string in JS.
f = f.replace(/\\\`/g, "\`"); 

fs.writeFileSync('src/components/domain/StoriesBar.tsx', f, 'utf8');
