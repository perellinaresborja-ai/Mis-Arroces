const fs = require('fs');

let post = fs.readFileSync('src/app/create/post/PostForm.tsx', 'utf8');
post = post.replace('<Label htmlFor="visibility">Visibilidad</Label>', '<Label htmlFor="visibility">Privacidad</Label>');
fs.writeFileSync('src/app/create/post/PostForm.tsx', post, 'utf8');

let cook = fs.readFileSync('src/app/recipes/[id]/cook/CookForm.tsx', 'utf8');
cook = cook.replace('<Label htmlFor="visibility">Visibilidad</Label>', '<Label htmlFor="visibility">Privacidad</Label>');
fs.writeFileSync('src/app/recipes/[id]/cook/CookForm.tsx', cook, 'utf8');
