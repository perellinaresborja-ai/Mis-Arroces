'use client';
import { useFormStatus } from "react-dom"
import { addHiddenWord } from "@/app/actions/settings"
import { useRef } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button disabled={pending} type="submit" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50">
      Añadir
    </button>
  )
}

export default function AddWordForm() {
  const formRef = useRef<HTMLFormElement>(null)
  
  return (
    <form ref={formRef} action={async (formData) => {
      const res = await addHiddenWord(formData)
      if (res?.error) {
        alert(res.error)
      } else {
        alert('Palabra añadida')
        formRef.current?.reset()
      }
    }} className="flex gap-2">
      <input 
        id="wordInput"
        name="word"
        type="text" 
        placeholder="Añadir palabra oculta..." 
        required 
        maxLength={50}
        className="flex-1 px-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <SubmitButton />
    </form>
  )
}


