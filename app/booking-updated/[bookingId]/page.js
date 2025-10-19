import { Suspense } from 'react'
import { auth } from '@/app/_lib/auth'
import { redirect } from 'next/navigation'
import BookingUpdatedPage from '@/app/_components/BookingUpdatedPage'
import { getBooking } from '@/app/_lib/data-service'

export const metadata = {
  title: 'Booking Updated | NAILAHOLICS',
  description: 'Your booking has been updated successfully',
}

function UpdatedLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading confirmation...</p>
      </div>
    </div>
  )
}

async function UpdatedContent({ bookingId }) {
  const session = await auth()

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect(`/login?redirect=/booking-updated/${bookingId}`)
  }

  // Get the updated booking
  const booking = await getBooking(bookingId)

  // Verify the booking belongs to the user
  if (!booking || booking.clientId !== session.user.clientId) {
    redirect('/appointments')
  }

  return <BookingUpdatedPage booking={booking} session={session} />
}

export default function BookingUpdatedRoute({ params }) {
  return (
    <Suspense fallback={<UpdatedLoading />}>
      <UpdatedContent bookingId={params.bookingId} />
    </Suspense>
  )
}
