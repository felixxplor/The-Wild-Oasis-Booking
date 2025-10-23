// app/api/auth/update-password/route.js
import { supabase } from '@/app/_lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { password, accessToken } = await request.json()

    if (!password || !accessToken) {
      return NextResponse.json({ error: 'Password and access token are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Create a new supabase client with the access token
    const supabaseClient = supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: '',
    })

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
