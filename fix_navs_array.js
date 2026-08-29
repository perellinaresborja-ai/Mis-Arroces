const fs = require('fs');

function fixNav(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /\/\/ @ts-ignore\n\s*if \(data\?\.avatar\?\.storage_path\) \{\n\s*\/\/ @ts-ignore\n\s*setAvatarUrl\(`https:\/\/zvesoygqssyyojqyswwm\.supabase\.co\/storage\/v1\/object\/public\/recipe_media\/\$\{data\.avatar\.storage_path\}`\);\n\s*\}/,
    `const avatarPath = Array.isArray(data?.avatar) ? data.avatar[0]?.storage_path : data?.avatar?.storage_path;
          if (avatarPath) {
            setAvatarUrl(\`https://zvesoygqssyyojqyswwm.supabase.co/storage/v1/object/public/recipe_media/\${avatarPath}\`);
          }`
  );
  fs.writeFileSync(file, code);
}

fixNav('src/components/domain/DesktopNav.tsx');
fixNav('src/components/domain/BottomNav.tsx');
console.log('Fixed navs array handling');
