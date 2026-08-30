const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/MessageInput.tsx', 'utf8');

// The original layout is:
// <div className="flex items-center gap-2">
//   <input type="file" hidden ref={fileInputRef} accept="image/*,video/mp4,video/webm" onChange={handleFile} disabled={disabled || isSending} />
//   <Button type="button" variant="ghost" size="icon" disabled={disabled || isSending} onClick={() => fileInputRef.current?.click()}><ImageIcon className="w-5 h-5"/></Button>
//   <Input placeholder="Escribe un mensaje..." value={content} onChange={e => setContent(e.target.value)} disabled={disabled || isSending} className="flex-1 rounded-full bg-muted/50 border-border" />
//   <Button type="submit" size="icon" disabled={disabled || isSending || (!content.trim() && !file)} className="rounded-full"><ArrowUp className="w-5 h-5" strokeWidth={3} /></Button>
// </div>

const search = `<div className="flex items-center gap-2">
        <input type="file" hidden ref={fileInputRef} accept="image/*,video/mp4,video/webm" onChange={handleFile} disabled={disabled || isSending} />
        <Button type="button" variant="ghost" size="icon" disabled={disabled || isSending} onClick={() => fileInputRef.current?.click()}><ImageIcon className="w-5 h-5"/></Button>
        <Input placeholder="Escribe un mensaje..." value={content} onChange={e => setContent(e.target.value)} disabled={disabled || isSending} className="flex-1 rounded-full bg-muted/50 border-border" />
        <Button type="submit" size="icon" disabled={disabled || isSending || (!content.trim() && !file)} className="rounded-full"><ArrowUp className="w-5 h-5" strokeWidth={3} /></Button>
      </div>`;

const replace = `<div className="flex items-center gap-2">
        <input type="file" hidden ref={fileInputRef} accept="image/*,video/mp4,video/webm" onChange={handleFile} disabled={disabled || isSending} />
        <Input placeholder="Escribe un mensaje..." value={content} onChange={e => setContent(e.target.value)} disabled={disabled || isSending} className="flex-1 rounded-full bg-muted/50 border-border" />
        <Button type="button" size="icon" disabled={disabled || isSending} onClick={() => fileInputRef.current?.click()} className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"><Camera className="w-5 h-5"/></Button>
        <Button type="submit" size="icon" disabled={disabled || isSending || (!content.trim() && !file)} className="rounded-full shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"><ArrowUp className="w-5 h-5" strokeWidth={3} /></Button>
      </div>`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  // Also we need to make sure Camera is imported
  if (!code.includes('Camera')) {
    code = code.replace('import { Image as ImageIcon, Video, X, ArrowUp } from "lucide-react"', 'import { Image as ImageIcon, Video, X, ArrowUp, Camera } from "lucide-react"');
  }
  fs.writeFileSync('src/components/domain/messages/MessageInput.tsx', code);
  console.log('Fixed MessageInput');
} else {
  console.log('Search string not found in MessageInput');
}
