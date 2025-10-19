'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useReservation } from './ReservationContext'
import BookingSummary from './BookingSummary'

export default function BookingSummaryPage({
  selectedServices,
  selectedArtist,
  availableStaff,
  services,
  session,
  totalPrice,
  totalDuration,
  dateStr,
  time,
}) {
  const router = useRouter()
  const { setReservation } = useReservation()

  // Set reservation state from URL params
  useEffect(() => {
    if (dateStr && time) {
      setReservation({
        date: new Date(dateStr),
        time: time,
      })
    }
  }, [dateStr, time, setReservation])

  const handleBack = () => {
    // Save state to sessionStorage
    const bookingState = {
      selectedServices,
      selectedArtist,
      date: dateStr,
      time: time,
    }
    sessionStorage.setItem('bookingState', JSON.stringify(bookingState))

    // Navigate back
    router.push('/booking')
  }
  return (
    <BookingSummary
      selectedServices={selectedServices}
      selectedArtist={selectedArtist}
      availableStaff={availableStaff}
      services={services}
      session={session}
      onBack={handleBack}
      totalPrice={totalPrice}
      totalDuration={totalDuration}
    />
  )
}
