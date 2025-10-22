import { supabase } from '@/app/_lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { name, email, phone, password } = await request.json()

    // Validate input
    if (!name?.trim() || !email || !phone?.trim() || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Fixed phone validation - allows numbers starting with 0
    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '')
    const phoneRegex = /^\+?\d{8,15}$/

    if (!phoneRegex.test(cleanedPhone)) {
      return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 })
    }

    // Sign up with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${
          process.env.NEXT_PUBLIC_SITE_URL || 'http://nailaholics.com.au'
        }/auth/callback`,
        data: {
          full_name: name,
          phone: cleanedPhone, // Use cleaned phone
        },
      },
    })

    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 })
    }

    if (data.user) {
      // Create additional user profile in your custom table
      const { error: profileError } = await supabase.from('client').insert([
        {
          email: data.user.email,
          fullName: name,
          phone: cleanedPhone, // Use cleaned phone
        },
      ])

      if (profileError) {
        // console.error('Profile creation error:', profileError)
        // Don't fail the registration if profile creation fails
        // The user account is already created in auth
      }
    }

    return NextResponse.json(
      { message: 'Registration successful', user: data.user },
      { status: 200 }
    )
  } catch (error) {
    // console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
