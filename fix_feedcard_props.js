const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

const regex = /user: \{\s*username: string\s*display_name: string \| null\s*avatar\?: \{ storage_path: string \} \| null\s*\}/s;

const newProps = `user: {
    id: string
    username: string
    display_name: string | null
    privacy_level?: string
    avatar?: { storage_path: string } | null
  }`;

if (regex.test(code)) {
    code = code.replace(regex, newProps);
    fs.writeFileSync('src/components/domain/FeedCard.tsx', code);
    console.log("PROPS REPLACED");
} else {
    console.log("PROPS NOT FOUND");
}
