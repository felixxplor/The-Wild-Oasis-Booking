// ==========================================
// DATE AND TIME UTILITIES
// ==========================================
// Use these functions throughout your app to avoid timezone issues

/**
 * Format a date string (YYYY-MM-DD) for display
 * @param {string} dateString - Date in YYYY-MM-DD format from database
 * @returns {string} Formatted date like "Saturday, January 25, 2025"
 */
export function formatBookingDate(dateString) {
  if (!dateString) return 'Date TBD'

  // Parse YYYY-MM-DD manually to avoid timezone conversion
  const [year, month, day] = dateString.split('-').map(Number)

  // Create date at noon local time to prevent timezone shifts
  const date = new Date(year, month - 1, day, 12, 0, 0)

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format a date string (YYYY-MM-DD) for short display
 * @param {string} dateString - Date in YYYY-MM-DD format from database
 * @returns {string} Formatted date like "Jan 25, 2025"
 */
export function formatBookingDateShort(dateString) {
  if (!dateString) return 'Date TBD'

  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12, 0, 0)

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a timestamp without timezone (YYYY-MM-DD HH:MM:SS) for time display
 * @param {string} timestamp - Timestamp from database
 * @returns {string} Formatted time like "10:00 AM"
 */
export function formatBookingTime(timestamp) {
  if (!timestamp) return 'Time TBD'

  // Extract time from "YYYY-MM-DD HH:MM:SS" format
  const timeMatch = timestamp.match(/(\d{2}):(\d{2}):(\d{2})/)

  if (timeMatch) {
    const [_, hours, minutes] = timeMatch
    const hour = parseInt(hours, 10)
    const minute = minutes
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour

    return `${displayHour}:${minute} ${ampm}`
  }

  return 'Time TBD'
}

/**
 * Calculate duration between start and end timestamps
 * @param {string} startTime - Start timestamp from database
 * @param {string} endTime - End timestamp from database
 * @returns {string} Duration like "60 minutes" or "1 hour 30 minutes"
 */
export function calculateBookingDuration(startTime, endTime) {
  if (!startTime || !endTime) return 'Duration TBD'

  // Extract time from timestamps
  const startMatch = startTime.match(/(\d{2}):(\d{2}):(\d{2})/)
  const endMatch = endTime.match(/(\d{2}):(\d{2}):(\d{2})/)

  if (startMatch && endMatch) {
    const [_, startHours, startMinutes] = startMatch
    const [__, endHours, endMinutes] = endMatch

    const startTotalMinutes = parseInt(startHours, 10) * 60 + parseInt(startMinutes, 10)
    const endTotalMinutes = parseInt(endHours, 10) * 60 + parseInt(endMinutes, 10)

    const durationMinutes = endTotalMinutes - startTotalMinutes

    if (durationMinutes < 60) {
      return `${durationMinutes} minutes`
    } else {
      const hours = Math.floor(durationMinutes / 60)
      const minutes = durationMinutes % 60
      if (minutes === 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
      }
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} minutes`
    }
  }

  return 'Duration TBD'
}

/**
 * Format date and time range for display
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} startTime - Start timestamp
 * @param {string} endTime - End timestamp
 * @returns {string} Full formatted string like "Saturday, January 25, 2025 at 10:00 AM - 11:00 AM"
 */
export function formatBookingDateTimeRange(date, startTime, endTime) {
  const formattedDate = formatBookingDate(date)
  const formattedStartTime = formatBookingTime(startTime)
  const formattedEndTime = formatBookingTime(endTime)

  return `${formattedDate} at ${formattedStartTime} - ${formattedEndTime}`
}

/**
 * Get day of week from date string
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Day name like "Saturday"
 */
export function getDayOfWeek(dateString) {
  if (!dateString) return ''

  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12, 0, 0)

  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

/**
 * Check if a booking date is in the past
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {string} timeString - Time in HH:MM:SS format (optional)
 * @returns {boolean}
 */
export function isBookingInPast(dateString, timeString) {
  if (!dateString) return false

  const [year, month, day] = dateString.split('-').map(Number)
  const now = new Date()

  if (timeString) {
    const timeMatch = timeString.match(/(\d{2}):(\d{2}):(\d{2})/)
    if (timeMatch) {
      const [_, hours, minutes] = timeMatch
      const bookingDate = new Date(year, month - 1, day, parseInt(hours), parseInt(minutes))
      return bookingDate < now
    }
  }

  // If no time provided, just compare dates
  const bookingDate = new Date(year, month - 1, day, 23, 59, 59)
  return bookingDate < now
}

/**
 * Format date for email templates
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date like "Saturday, Jan 25, 2025"
 */
export function formatDateForEmail(dateString) {
  if (!dateString) return 'Date TBD'

  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12, 0, 0)

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Convert Date object to YYYY-MM-DD string for database
 * Use this when creating or updating bookings
 * @param {Date} date - JavaScript Date object
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function formatDateForDB(date) {
  if (!date || !(date instanceof Date)) return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// ==========================================
// USAGE EXAMPLES
// ==========================================

/*
// In your components:
import { 
  formatBookingDate, 
  formatBookingTime, 
  calculateBookingDuration,
  formatDateForDB 
} from '@/app/_lib/dateUtils'

// For displaying bookings:
const displayDate = formatBookingDate(booking.date) // "Saturday, January 25, 2025"
const displayTime = formatBookingTime(booking.startTime) // "10:00 AM"
const duration = calculateBookingDuration(booking.startTime, booking.endTime) // "60 minutes"

// For creating bookings:
const bookingData = {
  date: formatDateForDB(selectedDate), // Converts Date object to "2025-01-25"
  time: selectedTime,
  ...
}
*/
