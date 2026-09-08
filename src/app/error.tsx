'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error('CAUGHT GLOBAL ERROR:', error);
    fetch('/api/log-error', {
      method: 'POST',
      body: error.stack || error.message || 'Unknown error'
    }).catch(console.error);
  }, [error]);

  return (
    <div style={{ padding: '20px', color: 'red' }}>
      <h1>Crash interceptado!</h1>
      <pre>{error.message}</pre>
      <pre>{error.stack}</pre>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
