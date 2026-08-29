const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

code = code.replace(
  /export function OverlayRenderer\(\{ overlay, mode, onOverlayClick, isSelected \}: \{ overlay: StoryOverlay; mode: 'EDITOR'\|'VIEWER'; onOverlayClick\?: \(overlay: StoryOverlay\) => void; isSelected\?: boolean \}\) \{/,
  `export function OverlayRenderer({ overlay, mode, onOverlayClick, isSelected, storyId, questionReplies, setQuestionReplies, isSendingQ, setIsSendingQ, sentQ, setSentQ, onPauseRequest, onResumeRequest }: any) {`
);

code = code.replace(
  /<OverlayRenderer\s*overlay=\{overlay\}\s*mode=\{mode\}\s*onOverlayClick=\{onOverlayClick\}\s*isSelected=\{selectedOverlayId === overlay.id\}\s*\/>/g,
  `<OverlayRenderer 
      overlay={overlay} 
      mode={mode} 
      onOverlayClick={onOverlayClick} 
      isSelected={selectedOverlayId === overlay.id} 
      storyId={storyId}
      questionReplies={questionReplies}
      setQuestionReplies={setQuestionReplies}
      isSendingQ={isSendingQ}
      setIsSendingQ={setIsSendingQ}
      sentQ={sentQ}
      setSentQ={setSentQ}
      onPauseRequest={onPauseRequest}
      onResumeRequest={onResumeRequest}
    />`
);

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log('Fixed OverlayRenderer props');
