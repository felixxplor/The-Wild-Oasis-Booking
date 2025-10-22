'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    // Basic validation
    if (!name.trim()) {
      setError('Name is required')
      setIsLoading(false)
      return
    }

    if (!phone.trim()) {
      setError('Phone number is required')
      setIsLoading(false)
      return
    }

    // Clean phone number and validate
    const cleanedPhone = phone.trim().replace(/[\s\-\(\)]/g, '')

    // Updated regex - more lenient for international numbers
    const phoneRegex = /^\+?\d{8,15}$/

    if (!phoneRegex.test(cleanedPhone)) {
      setError('Please enter a valid phone number (8-15 digits)')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      const requestBody = {
        name: name.trim(),
        email: email.trim(),
        phone: cleanedPhone,
        password,
      }

      // Call server action for registration
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Registration failed')
      }

      setMessage('Registration successful! Redirecting...')

      // Get all redirect parameters from URL
      const redirect = searchParams.get('redirect')
      const services = searchParams.get('services')
      const artist = searchParams.get('artist')
      const date = searchParams.get('date')
      const time = searchParams.get('time')

      // If we have booking parameters, redirect to login with all params
      // Login page will handle the final redirect to booking-summary
      if (redirect && services && artist && date && time) {
        const loginUrl = `/login?redirect=${redirect}&services=${services}&artist=${artist}&date=${date}&time=${time}`

        setTimeout(() => {
          router.push(loginUrl)
        }, 1500)
      } else {
        // No booking params, just go to login
        setTimeout(() => {
          router.push('/login')
        }, 1500)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError(error.message || 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative pt-[150px] pb-10 flex flex-col justify-center items-center">
      <h2 className="text-[34px] text-[#414141] leading-[38px] mb-11">Register</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full max-w-md">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 w-full max-w-md">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center mt-11 w-full max-w-md"
      >
        <input
          type="text"
          name="name"
          placeholder="Full Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
          className="border-b border-[#9d9d9c] bg-transparent w-full h-[45px] mb-4 px-2 focus:outline-none disabled:opacity-50"
        />

        <input
          type="email"
          name="email"
          placeholder="Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="border-b border-[#9d9d9c] bg-transparent w-full h-[45px] mb-4 px-2 focus:outline-none disabled:opacity-50"
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={isLoading}
          className="border-b border-[#9d9d9c] bg-transparent w-full h-[45px] mb-4 px-2 focus:outline-none disabled:opacity-50"
        />

        <input
          type="password"
          name="password"
          placeholder="Password *"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          className="border-b border-[#9d9d9c] bg-transparent w-full h-[45px] mb-4 px-2 focus:outline-none disabled:opacity-50"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password *"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
          className="border-b border-[#9d9d9c] bg-transparent w-full h-[45px] mb-4 px-2 focus:outline-none disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="bg-transparent border border-[#414141] text-[#414141] text-xs tracking-[.22em] h-[55px] min-w-[240px] px-[50px] mt-11 transition duration-300 hover:bg-[#414141] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="mt-6 text-sm text-[#414141]">
        Already have an account?{' '}
        <a href="/login" className="underline hover:text-black">
          Login here
        </a>
      </p>
    </div>
  )
}
