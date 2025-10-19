import { supabase } from '@/app/_lib/supabase'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Sign in with Supabase Auth
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      return NextResponse.json({ error: signInError.message }, { status: 401 })
    }

    if (data.user && data.session) {
      // Set the session cookie
      const cookieStore = cookies()

      // Set session cookies for authentication
      cookieStore.set('supabase-auth-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
        sameSite: 'lax',
        maxAge: data.session.expires_in,
        path: '/',
      })

      cookieStore.set('supabase-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return NextResponse.json(
        {
          message: 'Login successful',
          user: {
            id: data.user.id,
            email: data.user.email,
            user_metadata: data.user.user_metadata,
          },
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ error: 'Login failed' }, { status: 401 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
