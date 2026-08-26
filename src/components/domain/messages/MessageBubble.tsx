import Link from 'next/link'

export function MessageBubble({ message, isOwn }: { message: any, isOwn: boolean }) {
  const { type, body, signed_url, entity_id } = message
  return (
    <div className={'flex mb-4 ' + (isOwn ? 'justify-end' : 'justify-start')}>
      <div className={'max-w-[75%] rounded-2xl p-3 ' + (isOwn ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>
        {type === 'TEXT' && <p>{body}</p>}
        {type === 'LINK' && <a href={body} target="_blank" rel="noopener noreferrer" className="underline">{body}</a>}
        {type === 'IMAGE' && signed_url && (
          <div className="space-y-2">
            <img src={signed_url} className="rounded-xl max-h-64 object-cover" alt="Image" />
            {body && <p>{body}</p>}
          </div>
        )}
        {type === 'VIDEO' && signed_url && (
          <div className="space-y-2">
            <video src={signed_url} controls className="rounded-xl max-h-64 object-cover" />
            {body && <p>{body}</p>}
          </div>
        )}
        {(type === 'RECIPE' || type === 'SESSION' || type === 'STORY') && (
          <Link href={'/' + (type === 'RECIPE' ? 'recipes' : type === 'SESSION' ? 'sessions' : 'stories') + '/' + entity_id}>
            <div className="border border-border/50 p-2 rounded-xl bg-background/50 hover:bg-background/80 transition-colors cursor-pointer">
              <p className="font-bold text-sm text-foreground">{type} Compartido</p>
              <p className="text-xs opacity-80 text-foreground">Toca para ver</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
