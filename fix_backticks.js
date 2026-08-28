const fs = require('fs');

let c = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');
c = c.replace(/`translate\(\$\{transform.translateX\}px, \$\{transform.translateY\}px\) scale\(\$\{transform.scale\}\)`/g, 
  "('translate(' + transform.translateX + 'px, ' + transform.translateY + 'px) scale(' + transform.scale + ')')");
c = c.replace(/`\$\{overlay.x \* 100\}%`/g, "(overlay.x * 100 + '%')");
c = c.replace(/`\$\{overlay.y \* 100\}%`/g, "(overlay.y * 100 + '%')");
c = c.replace(/`translate\(-50%, -50%\) scale\(\$\{overlay.scale\}\) rotate\(\$\{overlay.rotation\}deg\)`/g, 
  "('translate(-50%, -50%) scale(' + overlay.scale + ') rotate(' + overlay.rotation + 'deg)')");
fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', c);

let c2 = fs.readFileSync('src/components/domain/EditHighlightModal.tsx', 'utf8');
c2 = c2.replace(/`https:\/\/zvesoygqssyyojqyswwm.supabase.co\/storage\/v1\/object\/public\/recipe_media\/\$\{path\}`/g, 
  "('https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/' + path)");
c2 = c2.replace(/`aspect-\[9\/16\] bg-zinc-900 relative cursor-pointer \$\{isSelected \? 'ring-2 ring-primary ring-inset' : ''\}`/g,
  "('aspect-[9/16] bg-zinc-900 relative cursor-pointer ' + (isSelected ? 'ring-2 ring-primary ring-inset' : ''))");
fs.writeFileSync('src/components/domain/EditHighlightModal.tsx', c2);
