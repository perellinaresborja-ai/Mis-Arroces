const fs = require('fs');
let code = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');

const targetImg = `<img 
              src={fullUrl} 
              className="w-full h-full object-contain md:object-cover" 
              alt="Story"
              draggable={false}
            />`;

const replacementImg = `<img 
              src={fullUrl} 
              className="w-full h-full object-contain md:object-cover" 
              alt="Story"
              draggable={false}
              style={{
                transform: currentStory.media_transform 
                  ? \`translate(\${currentStory.media_transform.translateX}px, \${currentStory.media_transform.translateY}px) scale(\${currentStory.media_transform.scale}) rotate(\${currentStory.media_transform.rotation || 0}deg)\` 
                  : 'none'
              }}
            />`;

const targetVideo = `<video 
              ref={videoRef}
              src={fullUrl} 
              autoPlay 
              playsInline 
              muted={false}
              className="w-full h-full object-contain md:object-cover"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
            />`;

const replacementVideo = `<video 
              ref={videoRef}
              src={fullUrl} 
              autoPlay 
              playsInline 
              muted={false}
              className="w-full h-full object-contain md:object-cover"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              style={{
                transform: currentStory.media_transform 
                  ? \`translate(\${currentStory.media_transform.translateX}px, \${currentStory.media_transform.translateY}px) scale(\${currentStory.media_transform.scale}) rotate(\${currentStory.media_transform.rotation || 0}deg)\` 
                  : 'none'
              }}
            />`;

code = code.replace(targetImg, replacementImg);
code = code.replace(targetVideo, replacementVideo);

fs.writeFileSync('src/components/domain/StoriesViewer.tsx', code);
