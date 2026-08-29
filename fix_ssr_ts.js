const fs = require('fs');

let ssr = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

ssr = ssr.replace(/setIsSendingQ: Record<string, boolean>;/, 'setIsSendingQ?: Dispatch<SetStateAction<Record<string, boolean>>>;');
ssr = ssr.replace(/setIsSendingQ: setIsSendingQ,/, 'setIsSendingQ,');

ssr = ssr.replace(/ctx\?\.setIsSendingQ && ctx\.setIsSendingQ/g, 'ctx?.setIsSendingQ');
ssr = ssr.replace(/ctx\?\.setSentQ && ctx\.setSentQ/g, 'ctx?.setSentQ');
ssr = ssr.replace(/ctx\?\.setQuestionReplies && ctx\.setQuestionReplies/g, 'ctx?.setQuestionReplies');
ssr = ssr.replace(/ctx\?\.setSliderResults && ctx\.setSliderResults/g, 'ctx?.setSliderResults');
ssr = ssr.replace(/ctx\?\.setSliderValues && ctx\.setSliderValues/g, 'ctx?.setSliderValues');

// Fallbacks
ssr = ssr.replace(/ctx\?\.questionReplies/g, '(ctx?.questionReplies || {})');
ssr = ssr.replace(/ctx\?\.sentQ/g, '(ctx?.sentQ || {})');
ssr = ssr.replace(/ctx\?\.isSendingQ/g, '(ctx?.isSendingQ || {})');

// res.count
ssr = ssr.replace(/res\.count \+ 1/g, '(res.count || 0) + 1');
ssr = ssr.replace(/res\.count \+ 1/g, '(res.count || 0) + 1');

// ctx?.setQuestionReplies(...)
ssr = ssr.replace(/ctx\?\.setQuestionReplies\(\(prev: Record<string, any>\) => \(\{ \.\.\.prev, \[qId\]: \(e\.target as HTMLInputElement\)\.value \}\)\)/g, 'ctx?.setQuestionReplies && ctx.setQuestionReplies((prev: Record<string, any>) => ({ ...prev, [qId]: (e.target as HTMLInputElement).value }))');
ssr = ssr.replace(/ctx\?\.setIsSendingQ\(\(prev: Record<string, any>\) => \(\{ \.\.\.prev, \[qId\]: true \}\)\)/g, 'ctx?.setIsSendingQ && ctx.setIsSendingQ((prev: Record<string, any>) => ({ ...prev, [qId]: true }))');
ssr = ssr.replace(/ctx\?\.setIsSendingQ\(\(prev: Record<string, any>\) => \(\{ \.\.\.prev, \[qId\]: false \}\)\)/g, 'ctx?.setIsSendingQ && ctx.setIsSendingQ((prev: Record<string, any>) => ({ ...prev, [qId]: false }))');
ssr = ssr.replace(/ctx\?\.setSentQ\(\(prev: Record<string, any>\) => \(\{ \.\.\.prev, \[qId\]: true \}\)\)/g, 'ctx?.setSentQ && ctx.setSentQ((prev: Record<string, any>) => ({ ...prev, [qId]: true }))');

ssr = ssr.replace(/ctx\?\.setSliderResults\(\(prev: Record<string, any>\) => \(\{ \.\.\.prev, \[sId\]: newRes \}\)\)/g, 'ctx?.setSliderResults && ctx.setSliderResults((prev: Record<string, any>) => ({ ...prev, [sId]: newRes }))');
ssr = ssr.replace(/ctx\?\.setSliderValues\(\(prev: Record<string, any>\) => \(\{ \.\.\.prev, \[sId\]: val \}\)\)/g, 'ctx?.setSliderValues && ctx.setSliderValues((prev: Record<string, any>) => ({ ...prev, [sId]: val }))');

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', ssr);
console.log('Fixed SharedStoryRenderer errors.');
