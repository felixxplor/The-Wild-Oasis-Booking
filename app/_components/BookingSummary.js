'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useReservation } from './ReservationContext'
import SubmitButton from './SubmitButton'
import { createAppointment } from '../_lib/actions'

function BookingSummary({
  selectedServices,
  selectedArtist,
  availableStaff,
  services,
  session,
  onBack,
  totalPrice,
  totalDuration,
}) {
  const router = useRouter()
  const { reservation, resetReservation } = useReservation()
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Get selected service objects
  const getSelectedServiceObjects = () => {
    return services.filter((service) => selectedServices.includes(service.id))
  }

  // Get selected staff member info
  const getSelectedStaffInfo = () => {
    if (selectedArtist === 'any') {
      return { name: 'Any Available Artist', id: null }
    }
    return (
      availableStaff.find(
        (staff) => staff.name === selectedArtist || staff.id.toString() === selectedArtist
      ) || { name: selectedArtist, id: null }
    )
  }

  // Format price display
  const formatPrice = (service) => {
    if (service.discount) {
      const discountedPrice = service.regularPrice - service.discount
      return discountedPrice
    }
    return service.regularPrice
  }

  // Format date and time
  const formatDateTime = () => {
    if (!reservation.date || !reservation.time) return 'Date and time to be confirmed'

    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    const formattedDate = reservation.date.toLocaleDateString('en-US', options)
    return `${formattedDate} at ${reservation.time}`
  }

  // Validate booking data before submission
  const validateBookingData = () => {
    if (!session?.user) {
      throw new Error('You must be logged in to make a booking')
    }

    if (!selectedServices || selectedServices.length === 0) {
      throw new Error('Please select at least one service')
    }

    if (!reservation.date || !reservation.time) {
      throw new Error('Please select a date and time for your appointment')
    }

    if (!totalPrice || totalPrice <= 0) {
      throw new Error('Invalid booking total')
    }

    if (!totalDuration || totalDuration <= 0) {
      throw new Error('Invalid booking duration')
    }
  }

  // Create booking data
  const createBookingData = () => {
    const selectedStaffInfo = getSelectedStaffInfo()

    return {
      serviceIds: selectedServices,
      artistId: selectedStaffInfo.id,
      artistName: selectedArtist === 'any' ? null : selectedArtist,
      date: reservation.date,
      time: reservation.time,
      totalPrice,
      totalDuration,
      notes: notes.trim(),
    }
  }

  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true)
      setError('')

      // console.log('Starting submission...')

      // Validate the booking data
      validateBookingData()

      // Create booking data object
      const bookingData = createBookingData()

      // console.log('Submitting booking:', bookingData)

      // Call the server action to create the appointment
      const result = await createAppointment(bookingData, formData)

      // console.log('Result from server action:', result)

      if (result.success) {
        // console.log('Booking successful! Redirecting to:', `/thankyou?booking=${result.bookingId}`)

        // Reset the reservation state
        resetReservation?.()

        // Redirect to thank you page
        router.push(`/thankyou?booking=${result.bookingId}`)
      } else {
        // console.log('Booking failed:', result.error)
        setError(result.error || 'Failed to create booking. Please try again.')
        setIsSubmitting(false)
      }
    } catch (error) {
      // console.error('Error creating booking:', error)
      setError(error.message || 'Failed to create booking. Please try again.')
      setIsSubmitting(false)
    }
  }

  const selectedServiceObjects = getSelectedServiceObjects()
  const selectedStaffInfo = getSelectedStaffInfo()

  return (
    <div className="min-h-screen bg-gray-50 mt-20">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
            disabled={isSubmitting}
          >
            <ArrowLeft size={20} />
            Back to Service Selection
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Booking Summary</h1>
          <p className="text-gray-600">Please review your booking details before confirming</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
            {/* User Info Header */}
            {session?.user && (
              <div className="bg-blue-800 text-blue-100 px-6 py-4 flex justify-between items-center rounded-t-lg">
                <p>Logged in as</p>
                <div className="flex gap-4 items-center">
                  <p>{session.user.name}</p>
                </div>
              </div>
            )}

            {/* Booking Details */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking Details</h2>

              {/* Date & Time */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Appointment Date & Time</h3>
                <p className="text-gray-700">{formatDateTime()}</p>
              </div>

              {/* Selected Services */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Selected Services</h3>
                <div className="space-y-3">
                  {selectedServiceObjects.map((service) => (
                    <div
                      key={service.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.duration} minutes</p>
                        {service.description && (
                          <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {service.discount ? (
                          <div>
                            <span className="line-through text-gray-500 text-sm">
                              ${service.regularPrice}
                            </span>
                            <div className="font-semibold text-green-600">
                              ${formatPrice(service)}
                            </div>
                          </div>
                        ) : (
                          <div className="font-semibold">${formatPrice(service)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Artist */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Selected Artist</h3>
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    {selectedStaffInfo.avatar ? (
                      <img
                        src={selectedStaffInfo.avatar}
                        alt={selectedStaffInfo.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {selectedStaffInfo.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium">{selectedStaffInfo.name}</h4>
                      <p className="text-sm text-gray-600">
                        Total duration: {totalDuration} minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <form action={handleSubmit} className="space-y-6">
                {/* Special Requests */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Any special requests or notes?
                  </label>
                  <textarea
                    name="notes"
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                    rows={4}
                    placeholder="Any allergies, preferences, or special requirements..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{notes.length}/500 characters</p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  {!(reservation.date && reservation.time) ? (
                    <p className="text-gray-500 text-sm">Please select date and time first</p>
                  ) : !session?.user ? (
                    <p className="text-red-500 text-sm">Please log in to make a booking</p>
                  ) : (
                    <SubmitButton
                      pendingLabel="Creating Booking..."
                      disabled={isSubmitting}
                      className="text-[#414141] bg-transparent border border-[#414141] text-xs tracking-[.22em] h-[45px] min-w-[180px] px-[35px] transition duration-300 hover:bg-[#414141] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#414141]"
                    >
                      {isSubmitting ? 'PROCESSING...' : `CONFIRM BOOKING ($${totalPrice})`}
                    </SubmitButton>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="bg-white rounded-lg shadow-sm border h-fit">
            <div className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Booking Summary</h3>

              {/* Services Summary */}
              <div className="space-y-3 mb-4">
                {selectedServiceObjects.map((service) => (
                  <div key={service.id} className="flex justify-between text-sm">
                    <span>{service.name}</span>
                    <span>${formatPrice(service)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Duration:</span>
                  <span>{totalDuration} minutes</span>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium text-gray-800 mb-2">Appointment Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Date:</span>{' '}
                    {reservation.date ? reservation.date.toLocaleDateString() : 'Not selected'}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span> {reservation.time || 'Not selected'}
                  </p>
                  <p>
                    <span className="font-medium">Artist:</span> {selectedStaffInfo.name}
                  </p>
                </div>
              </div>

              {/* Location Info */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium text-gray-800 mb-2">Location</h4>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Nailaholics Nails & Beauty</p>
                  <p>4B Pitt St</p>
                  <p>Mortdale NSW 2223</p>
                  <p className="mt-2">(02) 9579 1881</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingSummary
