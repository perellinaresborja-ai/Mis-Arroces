const fs = require('fs');
let code = fs.readFileSync('src/app/messages/page.tsx', 'utf8');

// The code currently has:
// } catch (err) {
//   console.error(err)
// }

code = code.replace(/} catch \(err\) \{/, 
`} catch (err: any) {
      if (err?.message === 'NEXT_REDIRECT') throw err;
      // also Next.js 15+ sometimes uses an internal error with digest
      if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;`);

fs.writeFileSync('src/app/messages/page.tsx', code);
