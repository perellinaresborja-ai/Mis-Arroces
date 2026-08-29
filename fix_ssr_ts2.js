const fs = require('fs');
let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

code = code.replace(/interface RenderContext \{[\s\S]*?\}/, `export interface RenderContext {
  pollResults?: Record<string, PollResultData>;
  isVoting?: Record<string, boolean>;
  handleVote?: (pollId: string, option: string) => Promise<void>;
  questionReplies?: Record<string, string>;
  setQuestionReplies?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isSendingQ?: Record<string, boolean>;
  setIsSendingQ?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  sentQ?: Record<string, boolean>;
  setSentQ?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  handleQuestionReply?: (qId: string, prompt: string) => Promise<void>;
  sliderResults?: Record<string, SliderResultData>;
  setSliderResults?: React.Dispatch<React.SetStateAction<Record<string, SliderResultData>>>;
  sliderValues?: Record<string, number>;
  setSliderValues?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  handleSliderRelease?: (sId: string, val: number, prompt: string) => Promise<void>;
  onPauseRequest?: () => void;
  onResumeRequest?: () => void;
  storyId?: string;
}`);

// fix the questionReplies undefined etc
code = code.replace(/ctx\?\.questionReplies/g, '(ctx?.questionReplies || {})');
code = code.replace(/ctx\?\.sentQ/g, '(ctx?.sentQ || {})');
code = code.replace(/ctx\?\.isSendingQ/g, '(ctx?.isSendingQ || {})');

// fix res.count undefined
code = code.replace(/res\.count/g, '(res?.count || 0)');

fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log('Fixed TS Errors properly.');
