'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton({ children, pendingLabel, className = '' }) {
  // you can put this new useFormStatus hook only in the client component.
  // This hook is still in development, so it's still a beta feature.
  const { pending } = useFormStatus()

  return (
    <button
      disabled={pending}
      className={`text-[#414141] bg-transparent border border-[#414141] text-xs tracking-[.22em] h-[45px] min-w-[180px] px-[35px] transition duration-300 hover:bg-[#414141] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#414141] ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  )
}
