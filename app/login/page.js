'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import SignInButton from '../_components/SignInButton'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()

  // Get redirect URL and preserve query params
  const redirect = searchParams.get('redirect') || '/appointments'
  const services = searchParams.get('services')
  const artist = searchParams.get('artist')
  const date = searchParams.get('date')
  const time = searchParams.get('time')

  const buildCallbackUrl = () => {
    let callbackUrl = redirect
    if (services || artist || date || time) {
      const params = new URLSearchParams()
      if (services) params.set('services', services)
      if (artist) params.set('artist', artist)
      if (date) params.set('date', date)
      if (time) params.set('time', time)
      callbackUrl = `${redirect}?${params.toString()}`
    }
    return callbackUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error('Invalid email or password')
      }

      if (result?.ok) {
        // Save booking state to sessionStorage if we have booking parameters
        if (services && artist && date && time) {
          const bookingState = {
            selectedServices: services.split(',').map((id) => parseInt(id)),
            selectedArtist: artist,
            date: date,
            time: time,
          }
          sessionStorage.setItem('bookingState', JSON.stringify(bookingState))
        }

        // Build redirect URL with preserved params
        let redirectUrl = redirect
        if (services || artist || date || time) {
          const params = new URLSearchParams()
          if (services) params.set('services', services)
          if (artist) params.set('artist', artist)
          if (date) params.set('date', date)
          if (time) params.set('time', time)
          redirectUrl = `${redirect}?${params.toString()}`
        }

        router.push(redirectUrl)
      }
    } catch (error) {
      // console.error('Login error:', error)
      setError(error.message || 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  // Build register URL with all query params
  const buildRegisterUrl = () => {
    const params = new URLSearchParams()
    if (redirect) params.set('redirect', redirect)
    if (services) params.set('services', services)
    if (artist) params.set('artist', artist)
    if (date) params.set('date', date)
    if (time) params.set('time', time)

    const queryString = params.toString()
    return queryString ? `/register?${queryString}` : '/register'
  }

  return (
    <div className="relative pt-[150px] pb-10 flex flex-col justify-center items-center">
      <h2 className="text-[34px] text-[#414141] leading-[38px] mb-11">Login</h2>

      <div className="text-[15px] leading-[22px] text-[#414141] text-center">Welcome Back!</div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full max-w-md mt-4">
          {error}
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
        <div className="w-full max-w-md text-right mb-4">
          <a href="/forgot-password" className="text-sm text-[#414141] underline hover:text-black">
            Forgot Password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-transparent border border-[#414141] text-[#414141] text-xs tracking-[.22em] h-[55px] min-w-[240px] px-[50px] mt-11 transition duration-300 hover:bg-[#414141] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <SignInButton callbackUrl={buildCallbackUrl()} />

      <p className="mt-6 text-sm text-[#414141]">
        Do not have an account?{' '}
        <a href={buildRegisterUrl()} className="underline hover:text-black">
          Register here
        </a>
      </p>
    </div>
  )
}
