import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { createClient, getClient } from './data-service'
import { supabase } from '@/app/_lib/supabase'

const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'your-email@example.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Authenticate with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error || !data.user) {
            console.error('Supabase auth error:', error?.message)
            return null
          }

          // Return user object that will be stored in the session
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email,
            // Add any other user properties you need
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      // here you can do many other mechanisms to check the user but for now we just check if the user is logged in
      return !!auth?.user
    },

    // This callback actually runs before the actual sign in process happens. That means we can perform all kinds of operations here that are associated with the signin process. So, it's a bit like a middleware.
    async signIn({ user, account, profile }) {
      try {
        console.log('SignIn callback - User:', user)
        console.log('SignIn callback - Account:', account)

        const existingClient = await getClient(user.email)
        console.log('Existing client found:', existingClient)

        if (!existingClient) {
          console.log('Creating new client for:', user.email)
          await createClient({ email: user.email, fullName: user.name })
        } else {
          console.log('Client already exists, skipping creation')
        }

        return true
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    },

    // This callback runs after the signin callback. And also each time the session is checked out. For example when we call the auth() function. The session here in the parameter is exactly the same as the session object that is returned by the auth() function.
    async session({ session, token }) {
      try {
        const client = await getClient(session.user.email)

        if (client) {
          session.user.clientId = client.id
        }

        // Add user ID from token to session
        if (token.sub) {
          session.user.id = token.sub
        }

        return session
      } catch (error) {
        console.error('Session callback error:', error)
        return session
      }
    },

    async jwt({ token, user }) {
      // Persist the user ID to the token right after signin
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt', // Required when using credentials provider
  },
}

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig)
