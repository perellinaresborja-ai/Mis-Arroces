const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

const oldMediaContainer = `<div 
          className="flex-1 relative w-full h-full flex items-center justify-center"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {isVideo ? (
            <video 
              ref={videoRef}
              src={fullUrl} 
              autoPlay 
              playsInline 
              muted={false}
              className="w-full h-full object-contain md:object-cover"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
            />
          ) : (
            <img 
              src={fullUrl} 
              className="w-full h-full object-contain md:object-cover" 
              alt="Story"
              draggable={false}
            />
          )}`;

const newMediaContainer = `<div 
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
              className="w-full h-full object-contain md:object-cover"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
            />
          )}
          {fullUrl && !isVideo && (
            <img 
              src={fullUrl} 
              className="w-full h-full object-contain md:object-cover" 
              alt="Story"
              draggable={false}
            />
          )}`;

code = code.replace(oldMediaContainer, newMediaContainer);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
