const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

code = code.replace(/export export interface/g, 'export interface');

// fix questionReplies access
code = code.replace(/value=\{questionReplies\[qId\] \|\| ''\}/g, 'value={(ctx?.questionReplies || {})[qId] || \'\'}');
code = code.replace(/\{sentQ\[qId\] \?/g, '{(ctx?.sentQ || {})[qId] ?');
code = code.replace(/disabled=\{isSendingQ\[qId\] \!\|\| sentQ\[qId\]\}/g, 'disabled={(ctx?.isSendingQ || {})[qId] || (ctx?.sentQ || {})[qId]}');
code = code.replace(/isSendingQ\[qId\] \?/g, '(ctx?.isSendingQ || {})[qId] ?');

// fix ctx invocations
code = code.replace(/ctx\?\.setQuestionReplies\(/g, 'ctx?.setQuestionReplies && ctx.setQuestionReplies(');
code = code.replace(/ctx\?\.setIsSendingQ\(/g, 'ctx?.setIsSendingQ && ctx.setIsSendingQ(');
code = code.replace(/ctx\?\.setSentQ\(/g, 'ctx?.setSentQ && ctx.setSentQ(');
code = code.replace(/ctx\?\.setSliderResults\(/g, 'ctx?.setSliderResults && ctx.setSliderResults(');
code = code.replace(/ctx\?\.setSliderValues\(/g, 'ctx?.setSliderValues && ctx.setSliderValues(');
code = code.replace(/ctx\?\.handleVote\(/g, 'ctx?.handleVote && ctx.handleVote(');
code = code.replace(/ctx\?\.handleQuestionReply\(/g, 'ctx?.handleQuestionReply && ctx.handleQuestionReply(');
code = code.replace(/ctx\?\.handleSliderRelease\(/g, 'ctx?.handleSliderRelease && ctx.handleSliderRelease(');

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log('Fixed undefined errors.');
