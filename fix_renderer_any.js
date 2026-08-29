const fs = require('fs');

let code = fs.readFileSync('src/components/domain/SharedStoryRenderer.tsx', 'utf8');

// 1. Interfaces
const interfaces = `
interface PollResultData {
  a: number;
  b: number;
  total: number;
  userVoted: string | null;
}
interface SliderResultData {
  average: number;
  total: number;
  userValue: number | null;
}

export interface RenderContext {
  pollResults: Record<string, PollResultData>;
  isVoting: Record<string, boolean>;
  handleVote: (pollId: string, option: string) => Promise<void>;
  questionReplies: Record<string, string>;
  setQuestionReplies: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isSendingQ: Record<string, boolean>;
  sentQ: Record<string, boolean>;
  handleQuestionReply: (qId: string, prompt: string) => Promise<void>;
  sliderResults: Record<string, SliderResultData>;
  sliderValues: Record<string, number>;
  setSliderValues: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  handleSliderRelease: (sId: string, val: number, prompt: string) => Promise<void>;
  onPauseRequest?: () => void;
  onResumeRequest?: () => void;
  storyId?: string;
}
`;
if (!code.includes('interface PollResultData')) {
  code = code.replace(/import \{ MapPin, Utensils \} from "lucide-react"/, 'import { MapPin, Utensils } from "lucide-react"\n' + interfaces);
}

// 2. Types of useState
code = code.replace(/const \[pollResults, setPollResults\] = React\.useState<Record<string, any>>\(\{\}\);/g, 'const [pollResults, setPollResults] = React.useState<Record<string, PollResultData>>({});');
code = code.replace(/const \[sliderResults, setSliderResults\] = React\.useState<Record<string, any>>\(\{\}\);/g, 'const [sliderResults, setSliderResults] = React.useState<Record<string, SliderResultData>>({});');
code = code.replace(/const results: Record<string, any> = \{\};/g, 'const results: Record<string, PollResultData> = {};');

// 3. renderOverlayContent param
code = code.replace(/function renderOverlayContent\(overlay: StoryOverlay, mode: string, ctx\?: any\)/, 'function renderOverlayContent(overlay: StoryOverlay, mode: string, ctx?: RenderContext)');

// 4. handleClick typing
code = code.replace(/const handleClick = \(e: any\) => \{/, 'const handleClick = (e: React.MouseEvent) => {');

// 5. any casts in setState
code = code.replace(/setIsSendingQ\(\(prev: any\) =>/g, 'setIsSendingQ(prev =>');
code = code.replace(/setSentQ\(\(prev: any\) =>/g, 'setSentQ(prev =>');
code = code.replace(/setQuestionReplies\(\(prev: any\) =>/g, 'setQuestionReplies(prev =>');
code = code.replace(/setSliderResults\(\(prev: any\) =>/g, 'setSliderResults(prev =>');
code = code.replace(/setSliderValues\(\(prev: any\) =>/g, 'setSliderValues(prev =>');

// 6. err: any
code = code.replace(/catch \(e: any\)/g, 'catch (e: unknown)');
code = code.replace(/catch \(err: any\)/g, 'catch (err: unknown)');

// 7. handleChangeEnd
code = code.replace(/const handleChangeEnd = async \(e: any\) => \{/, 'const handleChangeEnd = async (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent | React.TouchEvent) => {');


fs.writeFileSync('src/components/domain/SharedStoryRenderer.tsx', code);
console.log("SharedStoryRenderer fixed.");
