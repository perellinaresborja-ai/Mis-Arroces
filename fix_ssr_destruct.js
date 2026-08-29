const fs = require('fs');

let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

// Replace the destructuring line completely
code = code.replace(
  /const \{ storyId, questionReplies, setQuestionReplies, isSendingQ, setIsSendingQ, sentQ, setSentQ, onPauseRequest, onResumeRequest, sliderResults, setSliderResults, sliderValues, setSliderValues \} = ctx \|\| \{\};/,
  `
    const storyId = safeCtx.storyId;
    const questionReplies = safeCtx.questionReplies || {};
    const setQuestionReplies = safeCtx.setQuestionReplies || (() => {});
    const isSendingQ = safeCtx.isSendingQ || {};
    const setIsSendingQ = safeCtx.setIsSendingQ || (() => {});
    const sentQ = safeCtx.sentQ || {};
    const setSentQ = safeCtx.setSentQ || (() => {});
    const onPauseRequest = safeCtx.onPauseRequest || (() => {});
    const onResumeRequest = safeCtx.onResumeRequest || (() => {});
    const sliderResults = safeCtx.sliderResults || {};
    const setSliderResults = safeCtx.setSliderResults || (() => {});
    const sliderValues = safeCtx.sliderValues || {};
    const setSliderValues = safeCtx.setSliderValues || (() => {});
  `
);

// We had some other safe replacements in my previous script that I didn't test properly?
// Let's also make sure `setQuestionReplies` is invoked properly instead of `safeCtx.setQuestionReplies?.(`
code = code.replace(/safeCtx\.setQuestionReplies\?\.\(/g, 'setQuestionReplies(');
code = code.replace(/safeCtx\.setIsSendingQ\?\.\(/g, 'setIsSendingQ(');
code = code.replace(/safeCtx\.setSentQ\?\.\(/g, 'setSentQ(');
code = code.replace(/safeCtx\.setSliderResults\?\.\(/g, 'setSliderResults(');
code = code.replace(/safeCtx\.setSliderValues\?\.\(/g, 'setSliderValues(');
code = code.replace(/safeCtx\.handleVote\?\.\(/g, '(safeCtx.handleVote || (() => Promise.resolve()))(');
code = code.replace(/safeCtx\.handleQuestionReply\?\.\(/g, '(safeCtx.handleQuestionReply || (() => Promise.resolve()))(');
code = code.replace(/safeCtx\.handleSliderRelease\?\.\(/g, '(safeCtx.handleSliderRelease || (() => Promise.resolve()))(');
code = code.replace(/safeCtx\.onPauseRequest\?\.\(/g, 'onPauseRequest(');
code = code.replace(/safeCtx\.onResumeRequest\?\.\(/g, 'onResumeRequest(');

// Also remove `disabled={isSendingQ[qId]}` -> `disabled={!!isSendingQ[qId]}` if needed, but boolean should be fine.

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log('Fixed destructuring fallback TS errors.');
