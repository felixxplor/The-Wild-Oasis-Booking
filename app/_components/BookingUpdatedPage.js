'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle, Calendar, Clock, DollarSign, User, FileText } from 'lucide-react'

export default function BookingUpdatedPage({ booking, session }) {
  const router = useRouter()

  // Format date and time
  const formatDateTime = (dateString, timeString) => {
    const date = new Date(dateString || timeString)
    return {
      date: date.toLocaleDateString('en-AU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-AU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    }
  }

  const { date: formattedDate, time: formattedTime } = formatDateTime(
    booking.date,
    booking.startTime
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Success Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full mb-4 sm:mb-6">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Booking Updated Successfully! 🎉
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Your appointment has been updated. We have sent a confirmation email to{' '}
            <span className="font-medium text-gray-900">{session.user.email}</span>
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 sm:px-8 py-4 sm:py-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Updated Booking Details</h2>
            <p className="text-blue-100 text-sm sm:text-base mt-1">Booking ID: #{booking.id}</p>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-6">
            {/* Date & Time */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Date</p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">
                    {formattedDate}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Time</p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">
                    {formattedTime}
                  </p>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Services</h3>
              <div className="space-y-3">
                {booking.services?.map((service) => (
                  <div
                    key={service.id}
                    className="flex justify-between items-center bg-gray-50 rounded-lg p-3 sm:p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {service.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">{service.duration} minutes</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      ${service.regularPrice}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff */}
            {booking.staff && (
              <div className="border-t pt-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Your Artist</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {booking.staff.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {booking.notes && (
              <div className="border-t pt-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Special Notes</p>
                    <p className="text-gray-900 text-sm sm:text-base">{booking.notes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-900 text-base sm:text-lg">
                    Total Amount
                  </span>
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                  ${booking.totalPrice}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">
            📋 Important Information
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>A confirmation email has been sent to your email address</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>
                If you need to make further changes, please do so at least 24 hours in advance
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Contact us at (02) 9579 1881 if you have any questions</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => router.push('/appointments')}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            View All Appointments
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-white text-gray-700 py-3 sm:py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors border-2 border-gray-200 text-sm sm:text-base"
          >
            Back to Home
          </button>
        </div>

        {/* Contact Section */}
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">Need to make changes?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <a
              href="tel:0295791881"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              📞 (02) 9579 1881
            </a>
            <span className="hidden sm:inline text-gray-300">|</span>
            <a
              href="mailto:nailaholics.official@gmail.com"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              ✉️ nailaholics.official@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
