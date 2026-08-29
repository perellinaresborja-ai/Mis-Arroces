const fs = require('fs');

let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

code = code.replace(
  /const \[mode, setMode\] = useState<'EDIT'\|'DRAW'\|'TEXT'\|'STICKER'>\('EDIT'\);/,
  `const [mode, setMode] = useState<'EDIT'|'DRAW'|'TEXT'|'STICKER'>('EDIT');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGlobalStoryDraft(file);
    const url = URL.createObjectURL(file);
    setDraftMediaUrl(url);
    if (file.type.startsWith("video/")) {
      setDraftMediaType("VIDEO");
    } else {
      setDraftMediaType("IMAGE");
    }
    setMode('EDIT');
  };`
);

fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
console.log('Fixed StoryCreator refs');
