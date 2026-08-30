const fs = require('fs');
let code = fs.readFileSync('src/components/domain/FeedCard.tsx', 'utf8');

const correctEnd = `</footer>

      {/* Inline Comments */}
      <FeedCommentsInline
        isOpen={isCommentsOpen}
        entityType={entityType}
        entityId={entityId}
        currentUserId={currentUserId}
        allowComments={true}
      />
    </article>
  )
}
`;

code = code.substring(0, code.indexOf('</footer>')) + correctEnd;

fs.writeFileSync('src/components/domain/FeedCard.tsx', code);
console.log('Fixed syntax error');
