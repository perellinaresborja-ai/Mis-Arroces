const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FeedFollowButton.tsx', 'utf8');

const target = `  // Don't show anything if already following, per typical feed UX
  if (status === 'ACCEPTED') {
    return null
  }`;

code = code.replace(target, '');

// Also change button text to show Siguiendo and adapt styling
const returnTarget = `<Button 
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={handleFollow}
      className="ml-2 h-7 px-3 text-xs rounded-full font-bold shadow-sm"
    >
      {status === 'PENDING' ? 'Pendiente' : 'Seguir'}
    </Button>`;

const newReturn = `<Button 
      type="button"
      variant={status === 'ACCEPTED' ? 'secondary' : 'outline'}
      size="sm"
      disabled={isPending}
      onClick={handleFollow}
      className={\`ml-2 h-7 px-3 text-xs rounded-full font-bold shadow-sm transition-colors \${status === 'ACCEPTED' ? 'bg-secondary/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 border border-transparent' : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'}\`}
    >
      {status === 'ACCEPTED' ? 'Siguiendo' : status === 'PENDING' ? 'Pendiente' : 'Seguir'}
    </Button>`;

code = code.replace(returnTarget, newReturn);

fs.writeFileSync('src/components/domain/FeedFollowButton.tsx', code);
