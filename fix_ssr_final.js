const fs = require('fs');

let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

// 1. We will replace occurrences of `ctx?.` with `(ctx || {})` where appropriate.
// Or just let's create safe fallbacks at the beginning of renderOverlayContent.
code = code.replace(
  /function renderOverlayContent\(overlay: StoryOverlay, mode: string, ctx\?: RenderContext\) \{/,
  `function renderOverlayContent(overlay: StoryOverlay, mode: string, ctx?: RenderContext) {
    const safeCtx = ctx || {};
    const safeQuestionReplies = safeCtx.questionReplies || {};
    const safeSentQ = safeCtx.sentQ || {};
    const safeIsSendingQ = safeCtx.isSendingQ || {};
    const safePollResults = safeCtx.pollResults || {};
    const safeSliderResults = safeCtx.sliderResults || {};
    const safeSliderValues = safeCtx.sliderValues || {};
    const safeIsVoting = safeCtx.isVoting || {};`
);

// 2. Replace variables inside renderOverlayContent
code = code.replace(/\(ctx\?\.questionReplies \|\| \{\}\)/g, 'safeQuestionReplies');
code = code.replace(/\(ctx\?\.sentQ \|\| \{\}\)/g, 'safeSentQ');
code = code.replace(/\(ctx\?\.isSendingQ \|\| \{\}\)/g, 'safeIsSendingQ');

// 3. Fix invocation TS errors: Use optional chaining invocation!
code = code.replace(/ctx\?\.setQuestionReplies && ctx\.setQuestionReplies\(/g, 'safeCtx.setQuestionReplies?.(');
code = code.replace(/ctx\?\.setIsSendingQ && ctx\.setIsSendingQ\(/g, 'safeCtx.setIsSendingQ?.(');
code = code.replace(/ctx\?\.setSentQ && ctx\.setSentQ\(/g, 'safeCtx.setSentQ?.(');
code = code.replace(/ctx\?\.setSliderResults && ctx\.setSliderResults\(/g, 'safeCtx.setSliderResults?.(');
code = code.replace(/ctx\?\.setSliderValues && ctx\.setSliderValues\(/g, 'safeCtx.setSliderValues?.(');
code = code.replace(/ctx\?\.handleVote && ctx\.handleVote\(/g, 'safeCtx.handleVote?.(');
code = code.replace(/ctx\?\.handleQuestionReply && ctx\.handleQuestionReply\(/g, 'safeCtx.handleQuestionReply?.(');
code = code.replace(/ctx\?\.handleSliderRelease && ctx\.handleSliderRelease\(/g, 'safeCtx.handleSliderRelease?.(');

// Just to be absolutely sure we don't have leftover ctx?. invocations
code = code.replace(/ctx\?\.setQuestionReplies\(/g, 'safeCtx.setQuestionReplies?.(');
code = code.replace(/ctx\?\.setIsSendingQ\(/g, 'safeCtx.setIsSendingQ?.(');
code = code.replace(/ctx\?\.setSentQ\(/g, 'safeCtx.setSentQ?.(');
code = code.replace(/ctx\?\.setSliderResults\(/g, 'safeCtx.setSliderResults?.(');
code = code.replace(/ctx\?\.setSliderValues\(/g, 'safeCtx.setSliderValues?.(');
code = code.replace(/ctx\?\.handleVote\(/g, 'safeCtx.handleVote?.(');
code = code.replace(/ctx\?\.handleQuestionReply\(/g, 'safeCtx.handleQuestionReply?.(');
code = code.replace(/ctx\?\.handleSliderRelease\(/g, 'safeCtx.handleSliderRelease?.(');
code = code.replace(/ctx\?\.onPauseRequest\(/g, 'safeCtx.onPauseRequest?.(');
code = code.replace(/ctx\?\.onResumeRequest\(/g, 'safeCtx.onResumeRequest?.(');


fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log('Fixed TS errors in SharedStoryRenderer using safeCtx');
