import { Suspense } from 'react'
import { auth } from '@/app/_lib/auth'
import { redirect } from 'next/navigation'
import { CheckCircle, Calendar, Clock, User, MapPin, Mail } from 'lucide-react'
import Link from 'next/link'
import { getBooking } from '../_lib/data-service'

export const metadata = {
  title: 'Booking Confirmed | NAILAHOLICS',
  description: 'Your appointment has been confirmed',
}

// Loading component
function ThankYouLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
      </div>
    </div>
  )
}

// Main content component
async function ThankYouContent({ searchParams }) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const bookingId = searchParams?.booking

  if (!bookingId || bookingId === 'unknown') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Your appointment has been successfully created. You will receive a confirmation email
            shortly.
          </p>
          <Link
            href="/appointments"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            View My Appointments
          </Link>
        </div>
      </div>
    )
  }

  // Fetch booking details
  let booking
  try {
    booking = await getBooking(bookingId)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">Your appointment has been created successfully.</p>
          <Link
            href="/appointments"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            View My Appointments
          </Link>
        </div>
      </div>
    )
  }

  if (!booking) {
    redirect('/appointments')
  }

  // Format date and time
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Time TBD'
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const calculateDuration = () => {
    if (!booking.startTime || !booking.endTime) return 'Duration TBD'
    const start = new Date(booking.startTime)
    const end = new Date(booking.endTime)
    const minutes = Math.round((end - start) / 60000)
    return `${minutes} minutes`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto pt-10">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-green-50 text-lg">
              Your appointment has been successfully scheduled
            </p>
            <p className="text-green-100 text-sm mt-2">Booking Reference: #{booking.id}</p>
          </div>

          {/* Booking Details */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Appointment Details</h2>

            <div className="space-y-4">
              {/* Date */}
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800">Date</h3>
                  <p className="text-gray-700">{formatDate(booking.date)}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800">Time</h3>
                  <p className="text-gray-700">
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </p>
                  <p className="text-sm text-gray-600">{calculateDuration()}</p>
                </div>
              </div>

              {/* Staff */}
              {booking.staff && (
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <User className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-800">Your Artist</h3>
                    <p className="text-gray-700">{booking.staff.name}</p>
                  </div>
                </div>
              )}

              {/* Services */}
              {booking.services && booking.services.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-3">Services</h3>
                  <div className="space-y-2">
                    {booking.services.map((service) => (
                      <div key={service.id} className="flex justify-between items-center">
                        <span className="text-gray-700">{service.name}</span>
                        <span className="font-medium text-gray-800">${service.regularPrice}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 flex justify-between items-center font-semibold">
                      <span>Total</span>
                      <span className="text-lg text-blue-600">${booking.totalPrice}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800">Location</h3>
                  <p className="text-gray-700 font-medium">Nailaholics Nails & Beauty</p>
                  <p className="text-gray-600 text-sm">4B Pitt St</p>
                  <p className="text-gray-600 text-sm">Mortdale NSW 2223</p>
                  <p className="text-gray-600 text-sm mt-1">(02) 9579 1881</p>
                </div>
              </div>

              {/* Notes */}
              {booking.notes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Special Requests</h3>
                  <p className="text-gray-700 text-sm">{booking.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">What is Next?</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <p>
                A confirmation email has been sent to{' '}
                <span className="font-medium">{session.user.email}</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <p>Need to reschedule? Contact us or manage your booking in your appointments</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/appointments"
            className="flex-1 bg-blue-600 text-white text-center px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            View My Appointments
          </Link>
          <Link
            href="/booking"
            className="flex-1 bg-white text-blue-600 border-2 border-blue-600 text-center px-6 py-3 rounded-lg hover:bg-blue-50 transition font-medium"
          >
            Book Another Appointment
          </Link>
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense
export default function ThankYouPage({ searchParams }) {
  return (
    <Suspense fallback={<ThankYouLoading />}>
      <ThankYouContent searchParams={searchParams} />
    </Suspense>
  )
}
