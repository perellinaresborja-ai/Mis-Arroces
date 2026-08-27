const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/MessageBubble.tsx', 'utf8');

code = code.replace(
  "const mediaUrl = attachmentPath ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/message_media/${attachmentPath}` : null;",
  `const mediaUrl = attachmentPath ? \`\${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/message_media/\${attachmentPath}\` : null;
  const [realtimeUrl, setRealtimeUrl] = useState<string | null>(mediaUrl);
  
  useEffect(() => {
    if (mediaUrl) {
      setRealtimeUrl(mediaUrl);
    } else if ((mType === 'IMAGE' || mType === 'VIDEO') && !mediaUrl) {
      // This happens for brand new messages arriving via Realtime 
      // because Realtime doesn't join the message_attachments table.
      const fetchAttachment = async () => {
        // Wait 500ms to ensure the second insert (attachment) has completed
        await new Promise(r => setTimeout(r, 500));
        const { data } = await supabase.from('message_attachments').select('storage_path').eq('message_id', message.id).single();
        if (data?.storage_path) {
          setRealtimeUrl(\`\${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/message_media/\${data.storage_path}\`);
        } else {
          // If network is slow, retry once after 1.5s
          setTimeout(async () => {
            const { data: retryData } = await supabase.from('message_attachments').select('storage_path').eq('message_id', message.id).single();
            if (retryData?.storage_path) {
              setRealtimeUrl(\`\${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/message_media/\${retryData.storage_path}\`);
            }
          }, 1500);
        }
      };
      fetchAttachment();
    }
  }, [mType, mediaUrl, message.id, supabase]);`
);

code = code.replace(
  "{mType === 'IMAGE' && mediaUrl && (",
  "{mType === 'IMAGE' && realtimeUrl && ("
);

code = code.replace(
  "<img src={mediaUrl}",
  "<img src={realtimeUrl}"
);

code = code.replace(
  "{mType === 'VIDEO' && mediaUrl && (",
  "{mType === 'VIDEO' && realtimeUrl && ("
);

code = code.replace(
  "<video src={mediaUrl}",
  "<video src={realtimeUrl}"
);

fs.writeFileSync('src/components/domain/messages/MessageBubble.tsx', code);
