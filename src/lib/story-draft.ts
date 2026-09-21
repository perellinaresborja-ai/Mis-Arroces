export let globalStoryDraftFile: File | null = null;
export let globalStoryDraftUrl: string | null = null;
export let globalStoryDraftType: 'IMAGE' | 'VIDEO' | null = null;
export let globalStoryDraftFresh: boolean = false;

export const setGlobalStoryDraft = (file: File) => {
  globalStoryDraftFile = file;
  if (globalStoryDraftUrl) {
    URL.revokeObjectURL(globalStoryDraftUrl);
  }
  globalStoryDraftUrl = URL.createObjectURL(file);
  globalStoryDraftType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
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
