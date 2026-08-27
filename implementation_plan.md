# Stories V2 Implementation Plan

## Goal Description
Complete the Stories V2 feature set according to the provided requirements. This includes making recipe photos fully editable in the Story canvas, adding story reactions, integrating story replies seamlessly into Messaging V1, and ensuring robust analytics, security, and UI/UX.

## User Review Required
> [!IMPORTANT]
> The stories you were looking at that were black were created BEFORE the previous fix was applied. To test the fix, you must create a BRAND NEW story. The old ones were saved without a photo and will always be black.
>
> In this plan, we will completely revamp how Recipe Stories work so you can edit the photo in the Canvas before publishing!

## Proposed Changes

### Story Creator & Viewer (Media & Canvas)
- **`src/components/domain/StoryCreator.tsx`**:
  - [MODIFY] When `initialRecipeId` is provided, fetch the recipe's main media URL and convert it into a `Blob`/`File` to set as `mediaFile`. This allows the recipe photo to be resized, dragged, and transformed exactly like a manually uploaded photo.
  - [MODIFY] Re-add `SharedStoryRenderer` to `StoriesViewer.tsx` so that backgrounds, transforms, and overlays are accurately rendered for both photos and videos.
- **`src/components/domain/StoriesViewer.tsx`**:
  - [MODIFY] Fix the "X" button (already patched in `main`).
  - [MODIFY] Add the Reactions bar (❤️, 🔥, 👏, 😋) and the "Responder..." input at the bottom of the viewer.

### Social Features (Reactions)
- **`supabase/migrations/`**:
  - [NEW] Create `story_reactions` table with `story_id`, `user_id`, `reaction_type`.
  - [NEW] Add RLS policies ensuring users can only manage their own reactions and view reactions on stories they have access to.
- **`src/app/actions/stories.ts`**:
  - [MODIFY] Add `addReaction`, `removeReaction` server actions.
  - [MODIFY] Integrate with the existing `notifications` system to send a "reaction" notification to the story owner.

### Messaging V1 Integration (Replies)
- **`src/app/actions/messaging.ts`**:
  - [MODIFY] Extend `sendMessage` to handle a `STORY` type where `entity_id` is the `story.id` and the `body` is the user's reply text.
- **`src/components/domain/messages/MessageBubble.tsx`**:
  - [MODIFY] Enhance the rendering of `STORY` messages to display a mini preview of the Story (if not expired/deleted) along with the reply text.
  - [MODIFY] Handle expired/deleted stories gracefully with a fallback UI ("Story caducada").

## Verification Plan
### Automated Tests
- Build process `npm run build` and `npx tsc --noEmit` to ensure type safety.

### Manual Verification
- Share a recipe -> Edit the photo in Canvas -> Publish -> View (should not be black, transform applied).
- Upload video -> verify playback and duration in viewer.
- React to a story -> check notification on owner's account.
- Reply to a story -> check DMs to see the mini-story preview and message.
