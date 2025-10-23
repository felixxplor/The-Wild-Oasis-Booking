// app/forgot-password/page.js
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    if (!email) {
      setError('Please enter your email')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      setSuccess(true)
    } catch (error) {
      setError(error.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative pt-[150px] pb-10 flex flex-col justify-center items-center">
      <h2 className="text-[34px] text-[#414141] leading-[38px] mb-11">Forgot Password</h2>

      <div className="text-[15px] leading-[22px] text-[#414141] text-center max-w-md mb-6">
        Enter your email address and we will send you a link to reset your password.
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full max-w-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 w-full max-w-md">
          Password reset email sent! Please check your inbox.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center mt-11 w-full max-w-md"
      >
        <input
          type="email"
          name="email"
          placeholder="Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading || success}
          className="border-b border-[#9d9d9c] bg-transparent w-full h-[45px] mb-4 px-2 focus:outline-none disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isLoading || success}
          className="bg-transparent border border-[#414141] text-[#414141] text-xs tracking-[.22em] h-[55px] min-w-[240px] px-[50px] mt-11 transition duration-300 hover:bg-[#414141] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-6 text-sm text-[#414141]">
        Remember your password?{' '}
        <a href="/login" className="underline hover:text-black">
          Login here
        </a>
      </p>
    </div>
  )
}
