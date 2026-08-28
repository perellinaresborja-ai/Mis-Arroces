const fs = require('fs');

let creator = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

// Detect isVideo
creator = creator.replace(
  /const \[mediaUrl, setMediaUrl\] = useState<string \| null>\(null\)/,
  `const [mediaUrl, setMediaUrl] = useState<string | null>(null)\n  const isVideo = mediaFile?.type.startsWith('video/') || mediaUrl?.match(/\\.(mp4|webm|ogg)$/i) !== null;`
);

// Add videoRef
creator = creator.replace(
  /const supabase = createClient\(\)/,
  `const supabase = createClient()\n  const videoRef = useRef<HTMLVideoElement>(null);`
);

// Add isVideo and videoRef to SharedStoryRenderer
creator = creator.replace(
  /<SharedStoryRenderer([\s\S]*?selectedOverlayId=\{selectedOverlayId\})/,
  `<SharedStoryRenderer$1\n            isVideo={!!isVideo}\n            videoRef={videoRef}`
);

fs.writeFileSync('src/components/domain/StoryCreator.tsx', creator);
console.log("UPDATED STORY CREATOR");
