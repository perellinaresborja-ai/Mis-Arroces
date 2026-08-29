const fs = require('fs');

let code = fs.readFileSync('src/components/domain/CommentSection.tsx', 'utf8');

// 1. Reorder buttons by finding the blocks and swapping them.
const likeBlockRegex = /\{!comment\.is_deleted && \(\s*<button onClick=\{handleLike\}[\s\S]*?<\/button>\s*\)\}/g;
const replyBlockRegex1 = /\{allowComments && !comment\.is_deleted && \(\s*<button onClick=\{\(\) => onReply[^>]*>\s*Responder\s*<\/button>\s*\)\}/g;
const replyBlockRegex2 = /\{allowComments && !comment\.is_deleted && \(\s*<button onClick=\{onReply\}[^>]*>\s*Responder\s*<\/button>\s*\)\}/g;

// Instead of regex swapping which is hard, I will just rewrite the `div` manually using string manipulation.
// Find the first <div className="flex items-center gap-4 mt-1 px-3 text-xs text-muted-foreground font-medium">
const start1 = code.indexOf('<div className="flex items-center gap-4 mt-1 px-3 text-xs text-muted-foreground font-medium">');
const end1 = code.indexOf('</div>', start1) + 6;

let div1 = code.substring(start1, end1);

// Parse blocks from div1
const likeMatch1 = div1.match(/\{!comment\.is_deleted && \(\s*<button onClick=\{handleLike\}[\s\S]*?<\/button>\s*\)\}/);
const replyMatch1 = div1.match(/\{allowComments && !comment\.is_deleted && \(\s*<button onClick=\{\(\) => onReply[^>]*>[\s\S]*?<\/button>\s*\)\}/);
const editMatch1 = div1.match(/\{isOwn && !comment\.is_deleted && \([\s\S]*?<\/button>\s*<\/>\s*\)\}/);

if (likeMatch1 && replyMatch1 && editMatch1) {
  const newDiv1 = `<div className="flex items-center gap-4 mt-1 px-3 text-xs text-muted-foreground font-medium">
            ${likeMatch1[0]}
            ${replyMatch1[0]}
            ${editMatch1[0]}
          </div>`;
  code = code.replace(div1, newDiv1);
}

// Second div
const start2 = code.indexOf('<div className="flex items-center gap-4 mt-1 px-2 text-[11px] text-muted-foreground font-medium">');
const end2 = code.indexOf('</div>', start2) + 6;

let div2 = code.substring(start2, end2);
const likeMatch2 = div2.match(/\{!comment\.is_deleted && \(\s*<button onClick=\{handleLike\}[\s\S]*?<\/button>\s*\)\}/);
const replyMatch2 = div2.match(/\{allowComments && !comment\.is_deleted && \(\s*<button onClick=\{onReply\}[\s\S]*?<\/button>\s*\)\}/);
const editMatch2 = div2.match(/\{isOwn && !comment\.is_deleted && \([\s\S]*?<\/button>\s*\)\}/);

if (likeMatch2 && replyMatch2 && editMatch2) {
  const newDiv2 = `<div className="flex items-center gap-4 mt-1 px-2 text-[11px] text-muted-foreground font-medium">
            ${likeMatch2[0]}
            ${replyMatch2[0]}
            ${editMatch2[0]}
          </div>`;
  code = code.replace(div2, newDiv2);
}

fs.writeFileSync('src/components/domain/CommentSection.tsx', code);
console.log('Reordered buttons');
