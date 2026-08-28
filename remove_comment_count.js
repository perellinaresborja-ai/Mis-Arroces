const fs = require('fs');
let code = fs.readFileSync('src/components/domain/CommentSection.tsx', 'utf8');

const regex = /<div className="flex items-center gap-2 font-bold text-lg">[\s\S]*?<\/div>/;

if (regex.test(code)) {
    code = code.replace(regex, '');
    fs.writeFileSync('src/components/domain/CommentSection.tsx', code);
    console.log("REMOVED COMMENT COUNT HEADER");
} else {
    console.log("REGEX FAILED");
}
