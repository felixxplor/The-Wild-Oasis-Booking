import { Suspense } from 'react'
import { auth } from '@/app/_lib/auth'
import { getClient } from '@/app/_lib/data-service'
import { redirect } from 'next/navigation'
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react'
import UpdateProfileForm from '@/app/_components/UpdateProfileForm'
import Link from 'next/link'

export const metadata = {
  title: 'My Profile | NAILAHOLICS',
  description: 'View and update your profile information',
}

// Loading component
function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main content component
async function ProfileContent() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch client data
  let client = null
  let error = null

  try {
    client = await getClient(session.user.email)
    if (!client) {
      error = 'Profile information not found'
    }
  } catch (err) {
    console.error('Error loading profile:', err)
    error = 'Failed to load your profile information'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto pt-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <Link
              href="/appointments"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Appointments
            </Link>
          </div>
          <p className="text-gray-600">View and update your personal information</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium mb-2">Error Loading Profile</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Profile Information */}
        {!error && client && (
          <div className="space-y-6">
            {/* Profile Overview Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                    {client.fullName || 'Name not set'}
                  </h2>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {client.email}
                  </p>
                  {client.created_at && (
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
                      <Calendar className="w-4 h-4" />
                      Member since{' '}
                      {new Date(client.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Profile Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Edit Profile Information</h3>
              <UpdateProfileForm client={client} />
            </div>

            {/* Contact Information Display (Read-only) */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-4">
                {client.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-gray-900">{client.phone}</p>
                    </div>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-900">{client.address}</p>
                    </div>
                  </div>
                )}
                {!client.phone && !client.address && (
                  <p className="text-gray-500 text-sm">
                    No additional contact information provided
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Main page component with Suspense
export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  )
}
