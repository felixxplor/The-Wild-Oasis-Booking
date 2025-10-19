'use client'

import { useState } from 'react'
import AppointmentCard from './AppointmentCard'

function AppointmentsList({ bookings, userEmail }) {
  const [filter, setFilter] = useState('all') // all, upcoming, past, cancelled

  // Categorize bookings
  const now = new Date()

  const categorizedBookings = bookings.reduce(
    (acc, booking) => {
      const bookingDate = new Date(booking.startTime || booking.date)

      if (booking.status === 'cancelled') {
        acc.cancelled.push(booking)
      } else if (bookingDate >= now) {
        acc.upcoming.push(booking)
      } else {
        acc.past.push(booking)
      }

      return acc
    },
    { upcoming: [], past: [], cancelled: [] }
  )

  // Sort bookings by date (upcoming: ascending, past: descending)
  categorizedBookings.upcoming.sort((a, b) => {
    const dateA = new Date(a.startTime || a.date)
    const dateB = new Date(b.startTime || b.date)
    return dateA - dateB
  })

  categorizedBookings.past.sort((a, b) => {
    const dateA = new Date(a.startTime || a.date)
    const dateB = new Date(b.startTime || b.date)
    return dateB - dateA
  })

  categorizedBookings.cancelled.sort((a, b) => {
    const dateA = new Date(a.startTime || a.date)
    const dateB = new Date(b.startTime || b.date)
    return dateB - dateA
  })

  // Get filtered bookings
  const getFilteredBookings = () => {
    switch (filter) {
      case 'upcoming':
        return categorizedBookings.upcoming
      case 'past':
        return categorizedBookings.past
      case 'cancelled':
        return categorizedBookings.cancelled
      default:
        return [
          ...categorizedBookings.upcoming,
          ...categorizedBookings.past,
          ...categorizedBookings.cancelled,
        ]
    }
  }

  const filteredBookings = getFilteredBookings()

  return (
    <div>
      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-2 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'upcoming' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Upcoming ({categorizedBookings.upcoming.length})
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'past' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Past ({categorizedBookings.past.length})
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-600">No {filter !== 'all' && filter} appointments found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <AppointmentCard key={booking.id} booking={booking} userEmail={userEmail} />
          ))}
        </div>
      )}
    </div>
  )
}

export default AppointmentsList
