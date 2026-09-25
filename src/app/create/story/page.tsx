import { StoryCreator } from "@/components/domain/StoryCreator"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Crear Story",
  description: "Crea una nueva Story en misarroces",
}

export default async function CreateStoryPage(props: { searchParams?: Promise<{ recipe_id?: string, session_id?: string, post_id?: string, postId?: string, recipeId?: string, sessionId?: string, share?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")
  
  const searchParams = (await props.searchParams) || {};
  let finalRecipeId = searchParams.recipe_id || searchParams.recipeId;
  let finalSessionId = searchParams.session_id || searchParams.sessionId;
  let finalPostId = searchParams.post_id || searchParams.postId;

  if (searchParams.share) {
    try {
      const decodedShare = decodeURIComponent(searchParams.share);
      const pathOnly = decodedShare.replace(/^https?:\/\/[^/]+/i, '');
      
      const postMatch = pathOnly.match(/(?:\/p\/post|\/posts)\/([0-9a-fA-F-]+|[a-zA-Z0-9_-]+)/);
      const recipeMatch = pathOnly.match(/(?:\/p\/recipe|\/recipes)\/([0-9a-fA-F-]+|[a-zA-Z0-9_-]+)/);
      const sessionMatch = pathOnly.match(/(?:\/p\/session|\/sessions)\/([0-9a-fA-F-]+|[a-zA-Z0-9_-]+)/);

      if (postMatch && !finalPostId) {
        finalPostId = postMatch[1];
      } else if (recipeMatch && !finalRecipeId) {
        finalRecipeId = recipeMatch[1];
      } else if (sessionMatch && !finalSessionId) {
        finalSessionId = sessionMatch[1];
      }
    } catch (e) {
      console.error("Error parsing share parameter in create/story:", e);
    }
  }

  // Clean IDs of trailing slashes, query params or hashes
  if (finalRecipeId) finalRecipeId = finalRecipeId.split('?')[0].split('#')[0].replace(/\/+$/, '');
  if (finalSessionId) finalSessionId = finalSessionId.split('?')[0].split('#')[0].replace(/\/+$/, '');
  if (finalPostId) finalPostId = finalPostId.split('?')[0].split('#')[0].replace(/\/+$/, '');

  let recipeData = null;
  let recipeMedia = null;
  let sessionData = null;
  let postData = null;
  
  if (finalRecipeId) {
    const { data } = await supabase.from('recipes').select('id, name').eq('id', finalRecipeId).single();
    recipeData = data;
    const { data: media } = await supabase
      .from('recipe_media')
      .select('media:media_assets(storage_path), media_assets(storage_path)')
      .eq('recipe_id', finalRecipeId)
      .order('display_order', { ascending: true })
      .limit(1)
      .maybeSingle();
    
    const rPath = (media as any)?.media?.storage_path || (media as any)?.media_assets?.storage_path;
    if (rPath) {
      recipeMedia = { url: supabase.storage.from('recipe_media').getPublicUrl(rPath).data.publicUrl };
    }
  } else if (finalSessionId) {
    const { data } = await supabase
      .from('cooking_sessions')
      .select('id, notes, author:profiles!cooking_sessions_user_id_fkey(display_name, username)')
      .eq('id', finalSessionId)
      .single();
    const { data: media } = await supabase
      .from('session_media')
      .select('media:media_assets(storage_path), media_assets(storage_path)')
      .eq('session_id', finalSessionId)
      .limit(1)
      .maybeSingle();

    let coverUrl: string | undefined;
    const sPath = (media as any)?.media?.storage_path || (media as any)?.media_assets?.storage_path;
    if (sPath) {
      coverUrl = supabase.storage.from('recipe_media').getPublicUrl(sPath).data.publicUrl;
    }
    
    if (data) {
      const author = (data.author as any) || {};
      const authorName = author.username ? author.username.replace(/^@+/, '') : (author.display_name || 'Usuario');
      sessionData = { id: data.id, authorName, title: data.notes || undefined, coverUrl };
    }
  } else if (finalPostId) {
    const { data, error } = await supabase
      .from('social_posts')
      .select('id, content, recipe_id, author:profiles!social_posts_author_id_fkey(id, username, display_name)')
      .eq('id', finalPostId)
      .single();

    if (error) {
      console.error("Error fetching social_post for story:", error);
    }

    const { data: media } = await supabase
      .from('post_media')
      .select('display_order, media:media_assets(id, storage_path, media_type, mime_type), media_assets(id, storage_path, media_type, mime_type)')
      .eq('post_id', finalPostId)
      .order('display_order', { ascending: true })
      .limit(1)
      .maybeSingle();

    let coverUrl: string | undefined;
    const mediaAsset = (media as any)?.media || (media as any)?.media_assets;
    const storagePath = mediaAsset?.storage_path;
    let isVideo = mediaAsset?.media_type === 'VIDEO' || mediaAsset?.mime_type?.startsWith('video/');

    if (storagePath) {
      coverUrl = supabase.storage.from('recipe_media').getPublicUrl(storagePath).data.publicUrl;
    } else if (data?.recipe_id) {
      const { data: rMedia } = await supabase
        .from('recipe_media')
        .select('media:media_assets(storage_path), media_assets(storage_path)')
        .eq('recipe_id', data.recipe_id)
        .order('display_order', { ascending: true })
        .limit(1)
        .maybeSingle();
      const rPath = (rMedia as any)?.media?.storage_path || (rMedia as any)?.media_assets?.storage_path;
      if (rPath) {
        coverUrl = supabase.storage.from('recipe_media').getPublicUrl(rPath).data.publicUrl;
        isVideo = false;
      }
    }

    if (coverUrl && (/\.(mp4|webm|mov)(\?.*)?$/i.test(coverUrl) || coverUrl.includes('video/'))) {
      isVideo = true;
    }
    
    if (data) {
      const author = (data.author as any) || {};
      const authorName = author.username ? author.username.replace(/^@+/, '') : (author.display_name || 'Usuario');
      postData = { 
        id: data.id, 
        authorName, 
        text: data.content || undefined, 
        coverUrl, 
        mediaType: isVideo ? 'VIDEO' : 'IMAGE' 
      };
    }
  }

  return (
    <div className="bg-black min-h-screen">
      <StoryCreator 
        initialRecipe={recipeData ? { id: recipeData.id, name: recipeData.name, coverUrl: recipeMedia?.url } : undefined}
        initialSession={sessionData ? { id: sessionData.id, authorName: sessionData.authorName, title: sessionData.title, coverUrl: sessionData.coverUrl } : undefined}
        initialPost={postData ? { id: postData.id, authorName: postData.authorName, text: postData.text, coverUrl: postData.coverUrl, mediaType: postData.mediaType as any } : undefined}
      />
    </div>
  )
}


