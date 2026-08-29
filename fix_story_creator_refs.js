const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

code = code.replace(
  /const \[mode, setMode\] = useState<'EDIT' \| 'TEXT' \| 'DRAW' \| 'STICKER'>\('EDIT'\)/,
  `const [mode, setMode] = useState<'EDIT' | 'TEXT' | 'DRAW' | 'STICKER'>('EDIT')
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGlobalStoryDraft(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    if (file.type.startsWith("video/")) {
      setMediaType("VIDEO");
    } else {
      setMediaType("IMAGE");
    }
  };`
);

code = code.replace(
  /import \{ User, ChefHat, MapPin, AlignLeft, Apple \} from 'lucide-react';/,
  `import { User, ChefHat, MapPin, AlignLeft, Apple, Image as ImageIcon } from 'lucide-react';`
);

fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
console.log('Fixed StoryCreator refs');
