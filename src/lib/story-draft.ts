export let globalStoryDraftFile: File | null = null;
export let globalStoryDraftUrl: string | null = null;
export let globalStoryDraftType: 'IMAGE' | 'VIDEO' | null = null;
export let globalStoryDraftFresh: boolean = false;

export const isVideoFile = (file: File): boolean => {
  if (file.type && file.type.startsWith('video/')) return true;
  return /\.(mp4|mov|webm|m4v|3gp|mkv|avi|mts)$/i.test(file.name || '');
};

export const setGlobalStoryDraft = (file: File) => {
  globalStoryDraftFile = file;
  if (globalStoryDraftUrl) {
    URL.revokeObjectURL(globalStoryDraftUrl);
  }
  globalStoryDraftUrl = URL.createObjectURL(file);
  globalStoryDraftType = isVideoFile(file) ? 'VIDEO' : 'IMAGE';
  globalStoryDraftFresh = true;
};

export const consumeGlobalStoryDraft = () => {
  globalStoryDraftFresh = false;
};

export const clearGlobalStoryDraft = () => {
  if (globalStoryDraftUrl) {
    URL.revokeObjectURL(globalStoryDraftUrl);
  }
  globalStoryDraftFile = null;
  globalStoryDraftUrl = null;
  globalStoryDraftType = null;
  globalStoryDraftFresh = false;
};
