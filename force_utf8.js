const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let fixedCount = 0;

files.forEach(file => {
  // Read as utf-8. If the file has valid UTF-8, it stays the same.
  // If it had a BOM, we can strip it.
  const content = fs.readFileSync(file);
  
  // Is it valid UTF-8?
  const text = content.toString('utf8');
  
  // If there's a BOM, text will start with \uFEFF
  const hasBOM = text.charCodeAt(0) === 0xFEFF;
  
  // Let's rewrite it explicitly as clean utf8 without BOM just to be safe
  fs.writeFileSync(file, hasBOM ? text.slice(1) : text, 'utf8');
  fixedCount++;
});

console.log('Rewrote ' + fixedCount + ' files as UTF-8.');
