const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

const target = `        {/* Media Container */}
        <div 
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

const replacement = `        {/* Media Container */}
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

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
  console.log("Replaced!");
} else {
  console.log("NOT FOUND! Fallback to regex...");
  const regex = /\{\/\*\s*Media Container\s*\*\/\}.*?draggable=\{false\}\s*\/>\s*\)\}/s;
  if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
    console.log("Replaced with regex!");
  } else {
    console.log("STILL NOT FOUND");
  }
}
