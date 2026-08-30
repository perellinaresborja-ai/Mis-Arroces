const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');

if (!code.includes('useGesture')) {
  code = code.replace(
    "import React, { useState, useRef, useEffect } from 'react';",
    "import React, { useState, useRef, useEffect } from 'react';\nimport { useGesture } from '@use-gesture/react';"
  );
}

// Add state
if (!code.includes('mediaTransform')) {
  code = code.replace(
    "const [draftMediaType, setDraftMediaType] = useState<'IMAGE'|'VIDEO'|undefined>(initialMedia?.type);",
    "const [draftMediaType, setDraftMediaType] = useState<'IMAGE'|'VIDEO'|undefined>(initialMedia?.type);\n  const [mediaTransform, setMediaTransform] = useState({ translateX: 0, translateY: 0, scale: 1, rotation: 0 });"
  );
}

// Add useGesture hook
const hookCode = `
  useEffect(() => {
    // prevent default pinch zoom on the whole page when editing story
    const handler = (e: Event) => e.preventDefault();
    document.addEventListener('gesturestart', handler);
    document.addEventListener('gesturechange', handler);
    return () => {
      document.removeEventListener('gesturestart', handler);
      document.removeEventListener('gesturechange', handler);
    };
  }, []);

  const bindBackgroundGestures = useGesture({
    onDrag: ({ offset: [x, y], target }) => {
      // Only drag background if not dragging an overlay
      if ((target as HTMLElement).closest('.draggable-overlay')) return;
      setMediaTransform(prev => ({ ...prev, translateX: x, translateY: y }));
    },
    onPinch: ({ offset: [d, a], target }) => {
      if ((target as HTMLElement).closest('.draggable-overlay')) return;
      setMediaTransform(prev => ({ ...prev, scale: d, rotation: a }));
    }
  }, {
    drag: { from: () => [mediaTransform.translateX, mediaTransform.translateY] },
    pinch: { 
      from: () => [mediaTransform.scale, mediaTransform.rotation],
      scaleBounds: { min: 0.1, max: 10 }
    }
  });
`;

if (!code.includes('bindBackgroundGestures')) {
  code = code.replace(
    "const [isPublishing, setIsPublishing] = useState(false);",
    "const [isPublishing, setIsPublishing] = useState(false);\n" + hookCode
  );
}

// Attach bindBackgroundGestures to the container
code = code.replace(
  '<div ref={containerRef} className="relative w-full max-w-[400px]',
  '<div ref={containerRef} {...bindBackgroundGestures()} className="relative w-full max-w-[400px] touch-none'
);

// Pass mediaTransform to SharedStoryRenderer
code = code.replace(
  '<SharedStoryRenderer \n              mediaUrl={draftMediaUrl}',
  '<SharedStoryRenderer \n              transform={mediaTransform}\n              mediaUrl={draftMediaUrl}'
);

// We need to pass mediaTransform to the server action or story saving logic!
// Let's check where createStory is called.
const idx = code.indexOf('createStory(');
// we won't pass transform to db for now because they only mentioned "cuando eliges historurias el tmaño dd la foto que te deje ampliar...". Wait, if we don't save it, it will look normal to viewers!
// Wait, we DO want to save it! But createStory doesn't take transform yet? Let's check createStory API.
fs.writeFileSync('src/components/domain/StoryCreator.tsx', code);
console.log('Fixed StoryCreator gestures');
