import { Suspense } from 'react'
import { auth } from '@/app/_lib/auth'
import { getBooking, getServices, getStaffFullInfo } from '@/app/_lib/data-service'
import { redirect, notFound } from 'next/navigation'
import EditBookingPage from '@/app/_components/EditBookingPage'

export const metadata = {
  title: 'Edit Appointment | NAILAHOLICS',
  description: 'Edit your appointment details',
}

function EditBookingLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

async function EditBookingContent({ params }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const bookingId = parseInt(params.bookingId)

  // Fetch the booking
  let booking
  try {
    booking = await getBooking(bookingId)
  } catch (error) {
    // console.error('Error fetching booking:', error)
    notFound()
  }

  if (!booking) {
    notFound()
  }

  // Verify the booking belongs to the current user
  if (booking.clientId !== session.user.clientId) {
    redirect('/appointments')
  }

  // Check if booking can be edited (not in the past, not cancelled)
  const bookingDate = new Date(booking.startTime || booking.date)
  const isPast = bookingDate < new Date()
  const isCancelled = booking.status === 'cancelled'

  if (isPast || isCancelled) {
    // redirect('/appointments')
  }

  // Check if at least 24 hours away
  const hoursUntil = (bookingDate - new Date()) / (1000 * 60 * 60)
  if (hoursUntil < 24) {
    // redirect('/appointments')
  }

  // Fetch available services and staff with their relationships
  const [services, staffData] = await Promise.all([getServices(), getStaffFullInfo()])

  return (
    <EditBookingPage
      booking={booking}
      services={services}
      staffData={staffData}
      session={session}
    />
  )
}

export default function EditBookingPageRoute({ params }) {
  return (
    <Suspense fallback={<EditBookingLoading />}>
      <EditBookingContent params={params} />
    </Suspense>
  )
}
