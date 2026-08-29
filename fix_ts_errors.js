const fs = require('fs');

// 1. SharedStoryRenderer.tsx
let ssr = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');
ssr = ssr.replace(/import \{ CSSProperties, useEffect \} from "react"/, 'import { CSSProperties, useEffect, Dispatch, SetStateAction } from "react"');
ssr = ssr.replace(/interface PollResultData \{[\s\S]*?\}/, `interface PollResultData {
  countA?: number;
  countB?: number;
  total?: number;
  percentA?: number;
  percentB?: number;
  myVote?: string | null;
  a?: number;
  b?: number;
  userVoted?: string | null;
}`);
ssr = ssr.replace(/interface SliderResultData \{[\s\S]*?\}/, `interface SliderResultData {
  average: number;
  total?: number;
  count?: number;
  userValue: number | null;
}`);
ssr = ssr.replace(/setQuestionReplies: React\.Dispatch<React\.SetStateAction<Record<string, string>>>;/, 'setQuestionReplies?: Dispatch<SetStateAction<Record<string, string>>>;');
ssr = ssr.replace(/setSliderValues: React\.Dispatch<React\.SetStateAction<Record<string, number>>>;/, 'setSliderValues?: Dispatch<SetStateAction<Record<string, number>>>;');
ssr = ssr.replace(/setIsSendingQ: Record<string, boolean>;/, 'setIsSendingQ?: Dispatch<SetStateAction<Record<string, boolean>>>;');
ssr = ssr.replace(/setSentQ: Record<string, boolean>;/, 'setSentQ?: Dispatch<SetStateAction<Record<string, boolean>>>;');
ssr = ssr.replace(/setSliderResults: Record<string, SliderResultData>;/, 'setSliderResults?: Dispatch<SetStateAction<Record<string, SliderResultData>>>;');

ssr = ssr.replace(/ctx\?\.setIsSendingQ/g, 'ctx?.setIsSendingQ && ctx.setIsSendingQ');
ssr = ssr.replace(/ctx\?\.setSentQ/g, 'ctx?.setSentQ && ctx.setSentQ');
ssr = ssr.replace(/ctx\?\.setQuestionReplies/g, 'ctx?.setQuestionReplies && ctx.setQuestionReplies');
ssr = ssr.replace(/ctx\?\.setSliderResults/g, 'ctx?.setSliderResults && ctx.setSliderResults');
ssr = ssr.replace(/ctx\?\.setSliderValues/g, 'ctx?.setSliderValues && ctx.setSliderValues');

ssr = ssr.replace(/setIsSendingQ: setIsSendingQ,/g, 'setIsSendingQ,');
ssr = ssr.replace(/setSentQ: setSentQ,/g, 'setSentQ,');
ssr = ssr.replace(/setSliderResults: setSliderResults,/g, 'setSliderResults,');

ssr = ssr.replace(/prev =>/g, '(prev: any) =>'); // revert prev => so we can fix it properly
ssr = ssr.replace(/\(prev: any\) =>/g, '(prev: Record<string, any>) =>');

ssr = ssr.replace(/catch \(e: unknown\)/g, 'catch (e: any)');
ssr = ssr.replace(/catch \(err: unknown\)/g, 'catch (err: any)');
ssr = ssr.replace(/e\.target\.value/g, '(e.target as HTMLInputElement).value');

ssr = ssr.replace(/ctx\?\.questionReplies/g, '(ctx?.questionReplies || {})');
ssr = ssr.replace(/ctx\?\.isSendingQ/g, '(ctx?.isSendingQ || {})');
ssr = ssr.replace(/ctx\?\.sentQ/g, '(ctx?.sentQ || {})');

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', ssr);

// 2. CreateHighlightModal.tsx
let chm = fs.readFileSync('src/components/domain/CreateHighlightModal.tsx', 'utf8');
chm = chm.replace(/archivedStories\.find\(\(s: \{ id: string, story_media\?: \{ storage_path: string \}\[\] \}\) => s\.id === selectedIds\[0\]\)\.story_media\[0\]\.storage_path/g, 'archivedStories.find((s: { id: string, story_media?: { storage_path: string }[] }) => s.id === selectedIds[0])?.story_media?.[0]?.storage_path');
fs.writeFileSync('src/components/domain/CreateHighlightModal.tsx', chm);

// 3. ProfileHighlightsClient.tsx
let phc = fs.readFileSync('src/components/domain/ProfileHighlightsClient.tsx', 'utf8');
phc = phc.replace(/stories\?: unknown\[\];/g, 'stories?: any[];');
fs.writeFileSync('src/components/domain/ProfileHighlightsClient.tsx', phc);

// 4. StoriesViewer.tsx
let sv = fs.readFileSync('src/components/domain/StoriesViewer.tsx', 'utf8');
sv = sv.replace(/fetchStoryViewers\(currentStory\.id\)\.then\(setViewers\)/g, 'fetchStoryViewers(currentStory.id).then((v) => setViewers(v as any))');
fs.writeFileSync('src/components/domain/StoriesViewer.tsx', sv);

// 5. StoryCreator.tsx
let sc = fs.readFileSync('src/components/domain/StoryCreator.tsx', 'utf8');
sc = sc.replace(/Record<string, unknown>\[\]/g, 'any[]');
fs.writeFileSync('src/components/domain/StoryCreator.tsx', sc);

// 6. actions/stories.ts
let as = fs.readFileSync('src/app/actions/stories.ts', 'utf8');
as = as.replace(/Record<string, unknown>/g, 'any');
fs.writeFileSync('src/app/actions/stories.ts', as);

console.log('Fixed TS errors.');
