const fs = require('fs');

let viewer = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

// 1. Fix fullUrl fallback
viewer = viewer.replace(
  /const mediaObj = currentStory\.story_media\?\.\[0\]\?\.media;/,
  `const fallbackRecipeMediaObj = currentStory.recipe?.recipe_media?.[0]?.media;
  const mediaObj = currentStory.story_media?.[0]?.media || fallbackRecipeMediaObj;`
);

// 2. Replace the old Media Container with SharedStoryRenderer
const oldMediaContainer = `{/* Media Container */}
        <div 
          className="flex-1 relative w-full h-full flex items-center justify-center"
          style={!fullUrl && currentStory.background?.type === 'color' ? { backgroundColor: currentStory.background.value } : { backgroundColor: '#18181B' }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {fullUrl && isVideo && (
            <video 
              ref={videoRef}
              src={fullUrl} 
              autoPlay 
              playsInline 
              muted={false}
              className="max-w-full max-h-full object-contain md:object-cover"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              style={{
                transform: currentStory.media_transform 
                  ? \`translate(\${currentStory.media_transform.translateX}px, \${currentStory.media_transform.translateY}px) scale(\${currentStory.media_transform.scale}) rotate(\${currentStory.media_transform.rotation || 0}deg)\` 
                  : 'none'
              }}
            />
          )}
          {fullUrl && !isVideo && (
            <img 
              src={fullUrl} 
              className="max-w-full max-h-full object-contain md:object-cover" 
              alt="Story"
              draggable={false}
              style={{
                transform: currentStory.media_transform 
                  ? \`translate(\${currentStory.media_transform.translateX}px, \${currentStory.media_transform.translateY}px) scale(\${currentStory.media_transform.scale}) rotate(\${currentStory.media_transform.rotation || 0}deg)\` 
                  : 'none'
              }}
            />
          )}

          {/* Invisible Click Zones for navigation (only active if not showing viewers) */}
          {!showViewers && (
            <>
              <div className="absolute top-0 left-0 w-1/3 h-full z-10" onClick={(e) => { e.stopPropagation(); prevStory(); }} />
              <div className="absolute top-0 right-0 w-2/3 h-full z-10" onClick={(e) => { e.stopPropagation(); nextStory(); }} />
            </>
          )}
        </div>`;

const newMediaContainer = `{/* Media Container */}
        <div 
          className="flex-1 relative w-full h-full overflow-hidden"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <SharedStoryRenderer
            mode="VIEWER"
            mediaUrl={fullUrl}
            transform={currentStory.media_transform}
            background={currentStory.background}
            overlays={currentStory.overlays || []}
            isVideo={!!isVideo}
            videoRef={videoRef}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            isPaused={isPaused}
          />
          
          {/* Invisible Click Zones for navigation (only active if not showing viewers) */}
          {!showViewers && (
            <>
              <div className="absolute top-0 left-0 w-1/3 h-full z-50 cursor-pointer" onClick={(e) => { e.stopPropagation(); prevStory(); }} />
              <div className="absolute top-0 right-0 w-2/3 h-full z-50 cursor-pointer" onClick={(e) => { e.stopPropagation(); nextStory(); }} />
            </>
          )}
        </div>`;

if (viewer.includes('Media Container')) {
  // It's tricky to replace a huge block with regex reliably, so I'll do string splits.
  const startIdx = viewer.indexOf('{/* Media Container */}');
  const endIdx = viewer.indexOf('{/* Caption */}');
  if (startIdx !== -1 && endIdx !== -1) {
    viewer = viewer.substring(0, startIdx) + newMediaContainer + '\n\n        ' + viewer.substring(endIdx);
  } else {
    console.log("COULD NOT FIND START/END IDX");
  }
}

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', viewer);
console.log("UPDATED STORIES VIEWER");
