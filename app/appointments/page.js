import { Suspense } from 'react'
import { auth, signOut } from '@/app/_lib/auth'
import { getClientBookings } from '@/app/_lib/data-service'
import { redirect } from 'next/navigation'
import AppointmentsList from '@/app/_components/AppointmentsList'
import { Calendar, LogOut, UserCog } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'My Appointments | NAILAHOLICS',
  description: 'View and manage your appointments',
}

// Loading component
function AppointmentsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-36 sm:w-48 mb-2"></div>
          <div className="h-3 sm:h-4 bg-gray-200 rounded w-48 sm:w-64 mb-6 sm:mb-8"></div>
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-24 sm:w-32 mb-3 sm:mb-4"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3 sm:w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Main content component
async function AppointmentsContent() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Debug: Check if clientId exists
  console.log('Session user:', session.user)
  console.log('Client ID:', session.user.clientId)

  if (!session.user.clientId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              Account Setup Required
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Your account needs to be properly set up before you can view appointments. Please
              contact support or try logging in again.
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              User ID: {session.user.id || 'Not found'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  let bookings = []
  let error = null

  try {
    console.log('Fetching bookings for clientId:', session.user.clientId)
    bookings = await getClientBookings(session.user.clientId)
    console.log('Bookings fetched successfully:', bookings.length)
  } catch (err) {
    console.error('Error loading bookings:', err)
    error = err.message || 'Failed to load your appointments. Please try again later.'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto pt-16 sm:pt-10">
        {/* Header with Edit Profile and Logout Buttons */}
        <div className="mb-6 sm:mb-8">
          {/* Title Section */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              My Appointments
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              View and manage all your upcoming and past appointments
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Link href="/account" className="flex-1 sm:flex-initial">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-colors">
                <UserCog className="w-4 h-4" />
                Edit Profile
              </button>
            </Link>

            <form className="flex-1 sm:flex-initial">
              <button
                type="submit"
                formAction={async () => {
                  'use server'
                  await signOut({ redirectTo: '/' })
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </form>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
              Error Loading Appointments
            </p>
            <p className="text-red-600 text-xs sm:text-sm">{error}</p>
            <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2">
              If this problem persists, please contact support.
            </p>
          </div>
        )}

        {/* Appointments List */}
        {!error && bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">
              No Appointments Yet
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              You have not booked any appointments yet. Start by booking your first appointment!
            </p>
            <a
              href="/booking"
              className="inline-block bg-blue-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base"
            >
              Book an Appointment
            </a>
          </div>
        ) : !error ? (
          <AppointmentsList bookings={bookings} userEmail={session.user.email} />
        ) : null}
      </div>
    </div>
  )
}

// Main page component with Suspense
export default function AppointmentsPage() {
  return (
    <Suspense fallback={<AppointmentsLoading />}>
      <AppointmentsContent />
    </Suspense>
  )
}
