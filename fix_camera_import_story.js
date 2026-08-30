const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

if (!code.includes('Camera, User')) {
  code = code.replace("import { User, ChefHat, MapPin, AlignLeft, Apple, Image as ImageIcon } from 'lucide-react';", "import { Camera, User, ChefHat, MapPin, AlignLeft, Apple, Image as ImageIcon } from 'lucide-react';");
  fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
  console.log('Fixed Camera import in StoryCreator');
}
