const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

code = code.replace(
  /function renderOverlayContent\(overlay: StoryOverlay, mode: string\) \{/,
  `function renderOverlayContent(overlay: StoryOverlay, mode: string, ctx?: any) {
  const { storyId, questionReplies, setQuestionReplies, isSendingQ, setIsSendingQ, sentQ, setSentQ, onPauseRequest, onResumeRequest } = ctx || {};`
);

code = code.replace(
  /renderOverlayContent\(overlay, mode\)/g,
  `renderOverlayContent(overlay, mode, { storyId, questionReplies, setQuestionReplies, isSendingQ, setIsSendingQ, sentQ, setSentQ, onPauseRequest, onResumeRequest })`
);

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log('Patched renderOverlayContent');
