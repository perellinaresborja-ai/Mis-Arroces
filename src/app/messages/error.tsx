"use client"
export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-red-500">
      <h2 className="text-2xl font-bold mb-4">¡Fallo en el Cliente!</h2>
      <p className="mb-4">Se ha producido un error renderizando la interfaz.</p>
      <pre className="bg-red-500/10 p-4 rounded-xl text-left text-sm overflow-auto w-full max-w-2xl whitespace-pre-wrap break-words">{error.message}</pre>
      <pre className="bg-red-500/10 p-4 rounded-xl text-left text-xs overflow-auto w-full max-w-2xl mt-4 whitespace-pre-wrap break-words">{error.stack}</pre>
      <button onClick={() => reset()} className="mt-6 px-4 py-2 bg-red-500 text-white rounded-xl font-bold">Intentar de nuevo</button>
    </div>
  )
}
