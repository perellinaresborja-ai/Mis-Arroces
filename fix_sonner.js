const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FeedFollowButton.tsx', 'utf8');

code = code.replace(/import \{ toast \} from "sonner"\n/, '');
code = code.replace(/toast\.success\(".*?"\)/g, '');
code = code.replace(/toast\.error\(".*?"\)/g, '');

fs.writeFileSync('src/components/domain/FeedFollowButton.tsx', code);
