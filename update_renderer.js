const fs = require('fs');

let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

// Update interface
code = code.replace(
  /interface SharedStoryRendererProps \{/,
  `interface SharedStoryRendererProps {
  isVideo?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
  onTimeUpdate?: () => void;
  onEnded?: () => void;
  isPaused?: boolean;`
);

// Destructure new props
code = code.replace(
  /export function SharedStoryRenderer\(\{([\s\S]*?)\}: SharedStoryRendererProps\) \{/,
  `export function SharedStoryRenderer({$1, isVideo, videoRef, onTimeUpdate, onEnded, isPaused}: SharedStoryRendererProps) {`
);

// Add video effect
code = code.replace(
  /const containerStyle/,
  `import { useEffect } from "react"
  
  // Pause/play effect
  useEffect(() => {
    if (isVideo && videoRef?.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(e => console.log('Autoplay prevented', e));
      }
    }
  }, [isPaused, isVideo, videoRef]);
  
  const containerStyle`
);
// Above replace might duplicate import, let's just do it inline if possible, or use the existing imports.
// We can just add useEffect to the top if not there.

// Replace media rendering
let mediaRenderMatch = `      {/* Main Media Layer */}
      {mediaUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={mediaUrl} alt="Story Media" style={mediaStyle} />
      )}`;

let newMediaRender = `      {/* Main Media Layer */}
      {mediaUrl && isVideo && (
        <video 
          ref={videoRef}
          src={mediaUrl}
          style={mediaStyle}
          autoPlay
          playsInline
          muted={mode === 'EDITOR'} // Mute in editor
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
          loop={mode === 'EDITOR'}
        />
      )}
      {mediaUrl && !isVideo && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={mediaUrl} alt="Story Media" style={mediaStyle} draggable={false} />
      )}`;

code = code.replace(mediaRenderMatch, newMediaRender);

// Fix duplicate imports
code = code.replace(/import \{ CSSProperties \} from "react"/, `import { CSSProperties, useEffect } from "react"`);
// But wait, my manual inject had `import { useEffect } from "react"`, I'll fix that.
code = code.replace(/import \{ useEffect \} from "react"\s*\n\s*\/\/ Pause\/play effect/, `// Pause/play effect`);

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log("UPDATED SHAREDSTORYRENDERER");
