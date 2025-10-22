'use client'

import { useState } from 'react'
import {
  Calendar,
  Clock,
  User,
  MapPin,
  DollarSign,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { deleteReservation } from '@/app/_lib/actions'
import Link from 'next/link'

function AppointmentCard({ booking, userEmail }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Time TBD'
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Calculate duration
  const calculateDuration = () => {
    if (!booking.startTime || !booking.endTime) return null
    const start = new Date(booking.startTime)
    const end = new Date(booking.endTime)
    const minutes = Math.round((end - start) / 60000)
    return minutes
  }

  // Get status badge
  const getStatusBadge = () => {
    const statusConfig = {
      confirmed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Confirmed',
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: AlertCircle,
        label: 'Pending Confirmation',
      },
      cancelled: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircle,
        label: 'Cancelled',
      },
      completed: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: CheckCircle,
        label: 'Completed',
      },
    }

    const config = statusConfig[booking.status] || statusConfig.pending
    const Icon = config.icon

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    )
  }

  // Check if booking is in the past
  const isPast = () => {
    const bookingDate = new Date(booking.startTime || booking.date)
    return bookingDate < new Date()
  }

  // Check if booking can be cancelled (at least 24 hours in advance)
  const canCancel = () => {
    if (booking.status === 'cancelled' || isPast()) return false
    const bookingDate = new Date(booking.startTime || booking.date)
    const hoursUntilBooking = (bookingDate - new Date()) / (1000 * 60 * 60)
    return hoursUntilBooking >= 24
  }

  const canEdit = () => {
    if (booking.status === 'cancelled' || isPast()) return false
    const bookingDate = new Date(booking.startTime || booking.date)
    const hoursUntilBooking = (bookingDate - new Date()) / (1000 * 60 * 60)
    return hoursUntilBooking >= 24
  }

  // Handle cancel booking
  const handleCancelBooking = async () => {
    if (!canCancel()) return

    setIsCancelling(true)
    try {
      await deleteReservation(booking.id)
      setShowCancelConfirm(false)
      alert('Booking cancelled successfully!')
    } catch (error) {
      // console.error('Error cancelling booking:', error)
      alert(error.message || 'Failed to cancel booking. Please try again or contact us.')
    } finally {
      setIsCancelling(false)
    }
  }

  const duration = calculateDuration()

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Main Card Content */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Left Side - Main Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking #{booking.id}</h3>
                {getStatusBadge()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-gray-900 font-medium">{formatDate(booking.date)}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="text-gray-900 font-medium">
                    {formatTime(booking.startTime)}
                    {duration && ` (${duration} min)`}
                  </p>
                </div>
              </div>

              {/* Artist */}
              {booking.staff && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Artist</p>
                    <p className="text-gray-900 font-medium">{booking.staff.name}</p>
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-gray-900 font-medium">
                    ${booking.totalPrice}
                    {booking.isPaid && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        Paid
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Services Preview */}
            {booking.services && booking.services.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Services</p>
                <div className="flex flex-wrap gap-2">
                  {booking.services.map((service) => (
                    <span
                      key={service.id}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {service.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Actions */}
          <div className="flex flex-col gap-2 lg:ml-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Less Details
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  More Details
                </>
              )}
            </button>

            {canEdit() && (
              <Link
                href={`/appointments/edit/${booking.id}`}
                className="px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50 transition text-center"
              >
                Edit Booking
              </Link>
            )}

            {canCancel() && !showCancelConfirm && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>

        {/* Cancel Confirmation */}
        {showCancelConfirm && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 mb-3">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isCancelling}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Keep Booking
              </button>
            </div>
          </div>
        )}

        {/* Cancellation Warning */}
        {!canCancel() && booking.status !== 'cancelled' && !isPast() && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Cancellations must be made at least 24 hours in advance. To modify or cancel your
              booking, please contact us at (02) 9579 1881, email{' '}
              <a
                href="mailto:nailaholics.official@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow-900"
              >
                nailaholics.official@gmail.com
              </a>
              , or reach us on Instagram{' '}
              <a
                href="https://www.instagram.com/nailaholics.mortdale/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow-900"
              >
                @nailaholics.mortdale
              </a>
              .
            </p>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t bg-gray-50 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Complete Details</h4>

          <div className="space-y-4">
            {/* Services with prices */}
            {booking.services && booking.services.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Services</p>
                <div className="space-y-2">
                  {booking.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex justify-between items-start p-3 bg-white rounded border"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">{service.duration} minutes</p>
                      </div>
                      <p className="font-semibold text-gray-900">${service.regularPrice}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {booking.notes && (
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Special Requests</p>
                  <p className="text-sm text-gray-600">{booking.notes}</p>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Location</p>
                <p className="text-sm text-gray-900 font-medium">Nailaholics Nails & Beauty</p>
                <p className="text-sm text-gray-600">4B Pitt St</p>
                <p className="text-sm text-gray-600">Mortdale NSW 2223</p>
                <p className="text-sm text-gray-600 mt-1">(02) 9579 1881</p>
              </div>
            </div>

            {/* Booking Info */}
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                Booked on:{' '}
                {new Date(booking.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentCard
