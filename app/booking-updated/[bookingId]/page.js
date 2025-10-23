import { CheckCircle, Calendar, Clock, User, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function BookingUpdatedPage({ booking, session }) {
  // Add safety check for booking
  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Updated!</h1>
          <p className="text-gray-600 mb-6">Your appointment has been successfully updated.</p>
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

  // FIXED: Format date without timezone conversion
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD'

    // Parse the date string manually to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number)

    // Create date at noon local time to avoid timezone shifts
    const date = new Date(year, month - 1, day, 12, 0, 0)

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // FIXED: Format time from timestamp without timezone
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Time TBD'

    // Extract time from "YYYY-MM-DD HH:MM:SS" format
    const timeMatch = timestamp.match(/(\d{2}):(\d{2}):(\d{2})/)

    if (timeMatch) {
      const [_, hours, minutes] = timeMatch
      const hour = parseInt(hours, 10)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour

      return `${displayHour}:${minutes} ${ampm}`
    }

    return 'Time TBD'
  }

  const calculateDuration = () => {
    if (!booking.startTime || !booking.endTime) return 'Duration TBD'

    // Extract time from timestamps
    const startMatch = booking.startTime.match(/(\d{2}):(\d{2}):(\d{2})/)
    const endMatch = booking.endTime.match(/(\d{2}):(\d{2}):(\d{2})/)

    if (startMatch && endMatch) {
      const [_, startHours, startMinutes] = startMatch
      const [__, endHours, endMinutes] = endMatch

      const startTotalMinutes = parseInt(startHours, 10) * 60 + parseInt(startMinutes, 10)
      const endTotalMinutes = parseInt(endHours, 10) * 60 + parseInt(endMinutes, 10)

      const durationMinutes = endTotalMinutes - startTotalMinutes

      return `${durationMinutes} minutes`
    }

    return 'Duration TBD'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto pt-10">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Booking Updated!</h1>
            <p className="text-blue-50 text-lg">Your appointment has been successfully updated</p>
            {booking.id && (
              <p className="text-blue-100 text-sm mt-2">Booking Reference: #{booking.id}</p>
            )}
          </div>

          {/* Booking Details */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Updated Appointment Details
            </h2>

            <div className="space-y-4">
              {/* Date */}
              {booking.date && (
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-800">Date</h3>
                    <p className="text-gray-700">{formatDate(booking.date)}</p>
                  </div>
                </div>
              )}

              {/* Time */}
              {(booking.startTime || booking.endTime) && (
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
              )}

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
                    {booking.totalPrice && (
                      <div className="border-t pt-2 mt-2 flex justify-between items-center font-semibold">
                        <span>Total</span>
                        <span className="text-lg text-blue-600">${booking.totalPrice}</span>
                      </div>
                    )}
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

        {/* Information */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">What is Next?</h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <p>
                A confirmation email with the updated details has been sent to{' '}
                <span className="font-medium">{session?.user?.email || 'your email'}</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <p>
                Need to make more changes? You can manage your booking from your appointments page
              </p>
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
