const fs = require('fs');
let code = fs.readFileSync('src/components/domain/messages/ClientChat.tsx', 'utf8');

code = code.replace(
  /const pendingRequest = otherStatus === 'REQUEST'/,
  `const isWaitingForReply = otherStatus === 'REQUEST' && messages.length > 0;
  const canSendFirstRequestMessage = otherStatus === 'REQUEST' && messages.length === 0;`
);

code = code.replace(
  /\{pendingRequest \? \(/,
  `{isWaitingForReply ? (`
);

code = code.replace(
  /: myStatus === 'ACTIVE' \? \(/,
  `: (myStatus === 'ACTIVE' || canSendFirstRequestMessage) ? (`
);

fs.writeFileSync('src/components/domain/messages/ClientChat.tsx', code);
