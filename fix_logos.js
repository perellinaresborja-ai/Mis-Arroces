const fs = require('fs');
const files = [
  'src/app/login/page.tsx',
  'src/app/update-password/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/src="\/logo_paella_m\.png"/g, 'src="/mpng.png"');
    content = content.replace(/src="\/mwh\.png"/g, 'src="/mpng.png"');
    content = content.replace(/src="\/logopng\.png"/g, 'src="/mpng.png"');
    fs.writeFileSync(file, content, 'utf8');
  }
});
