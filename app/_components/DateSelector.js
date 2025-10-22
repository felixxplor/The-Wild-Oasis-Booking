'use client'

import { useState, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { getDay, isPast, isSameDay, addMonths, format } from 'date-fns'
import { useReservation } from './ReservationContext'
import { getStaffAbsences } from '../_lib/actions'

function generateTimeSlots(startTime, endTime, durationMinutes = 30, serviceDuration = 60) {
  const slots = []
  let [hour, minute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)

  const endTimeMinutes = endHour * 60 + endMinute

  while (hour * 60 + minute + serviceDuration <= endTimeMinutes) {
    const slot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    slots.push(slot)
    minute += durationMinutes
    if (minute >= 60) {
      hour += Math.floor(minute / 60)
      minute = minute % 60
    }
  }
  return slots
}

function hasBookingConflict(bookings, targetDate, targetTime, serviceDuration) {
  if (!bookings || bookings.length === 0) return false

  const year = targetDate.getFullYear()
  const month = String(targetDate.getMonth() + 1).padStart(2, '0')
  const day = String(targetDate.getDate()).padStart(2, '0')
  const targetDateStr = `${year}-${month}-${day}`

  const [targetHour, targetMinute] = targetTime.split(':').map(Number)
  const targetStartMinutes = targetHour * 60 + targetMinute
  const targetEndMinutes = targetStartMinutes + serviceDuration

  return bookings.some((booking) => {
    if (!booking.startTime || !booking.endTime) {
      return false
    }

    const startDateTime = new Date(booking.startTime)
    const endDateTime = new Date(booking.endTime)

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return false
    }

    const bookingDateStr = `${startDateTime.getFullYear()}-${String(
      startDateTime.getMonth() + 1
    ).padStart(2, '0')}-${String(startDateTime.getDate()).padStart(2, '0')}`

    const bookingStartTime = startDateTime.toTimeString().split(' ')[0]
    const bookingEndTime = endDateTime.toTimeString().split(' ')[0]

    if (bookingDateStr !== targetDateStr) {
      return false
    }

    const [bookingStartHour, bookingStartMinute] = bookingStartTime.split(':').map(Number)
    const [bookingEndHour, bookingEndMinute] = bookingEndTime.split(':').map(Number)

    const bookingStartMinutes = bookingStartHour * 60 + bookingStartMinute
    const bookingEndMinutes = bookingEndHour * 60 + bookingEndMinute

    const hasConflict =
      (targetStartMinutes >= bookingStartMinutes && targetStartMinutes < bookingEndMinutes) ||
      (targetEndMinutes > bookingStartMinutes && targetEndMinutes <= bookingEndMinutes) ||
      (targetStartMinutes <= bookingStartMinutes && targetEndMinutes >= bookingEndMinutes)

    return hasConflict
  })
}

// NEW: Check if staff is absent on a specific date
function isStaffAbsent(staffId, date, staffAbsences) {
  if (!staffAbsences || staffAbsences.length === 0) return false

  const dateStr = format(date, 'yyyy-MM-dd')

  return staffAbsences.some((absence) => {
    return absence.staffId === staffId && absence.absenceDate === dateStr
  })
}

export default function DateSelector({
  staffShifts = [],
  bookedSlots = [],
  serviceDuration = 60,
  isAnyArtist = false,
  availableStaff = [],
  selectedStaff = null,
  reservation: externalReservation,
  setReservation: externalSetReservation,
}) {
  const contextReservation = useReservation()
  const reservation = externalReservation || contextReservation?.reservation || {}
  const setReservation = externalSetReservation || contextReservation?.setReservation || (() => {})

  const [availableTimes, setAvailableTimes] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [staffAbsences, setStaffAbsences] = useState([])
  const [isLoadingAbsences, setIsLoadingAbsences] = useState(true)

  useEffect(() => {
    const fetchAbsences = async () => {
      setIsLoadingAbsences(true)
      const result = await getStaffAbsences()
      if (result.success) {
        setStaffAbsences(result.data)
      } else {
        console.error('Error:', result.error)
        setStaffAbsences([])
      }
      setIsLoadingAbsences(false)
    }
    fetchAbsences()
  }, [])

  const today = new Date()
  const maxDate = addMonths(today, 3)

  const handleDateSelect = (date) => {
    setReservation({ ...reservation, date, time: undefined })

    if (!date) {
      setAvailableTimes([])
      return
    }

    const dayOfWeek = getDay(date)
    let availableSlots = []

    if (isAnyArtist) {
      const allPossibleSlots = new Set()

      availableStaff.forEach((staff) => {
        // Check if staff is absent on this date
        if (isStaffAbsent(staff.id, date, staffAbsences)) {
          console.log(`Staff ${staff.name} is absent on ${format(date, 'yyyy-MM-dd')}`)
          return // Skip this staff member
        }

        const staffShiftsForDay = staff.staff_shifts?.filter((s) => s.dayOfWeek === dayOfWeek) || []

        staffShiftsForDay.forEach((shift) => {
          const slots = generateTimeSlots(shift.startTime, shift.endTime, 30, serviceDuration)

          slots.forEach((slot) => {
            if (!hasBookingConflict(staff.bookings, date, slot, serviceDuration)) {
              allPossibleSlots.add(slot)
            }
          })
        })
      })

      availableSlots = Array.from(allPossibleSlots).sort()
    } else if (selectedStaff) {
      // Check if the selected staff is absent on this date
      if (isStaffAbsent(selectedStaff.id, date, staffAbsences)) {
        console.log(
          `Selected staff ${selectedStaff.name} is absent on ${format(date, 'yyyy-MM-dd')}`
        )
        setAvailableTimes([])
        return
      }

      const shiftsForDay =
        selectedStaff.staff_shifts?.filter((s) => s.dayOfWeek === dayOfWeek) || []

      if (shiftsForDay.length === 0) {
        setAvailableTimes([])
        return
      }

      shiftsForDay.forEach((shift) => {
        const slots = generateTimeSlots(shift.startTime, shift.endTime, 30, serviceDuration)

        const availableSlotsForShift = slots.filter(
          (slot) => !hasBookingConflict(selectedStaff.bookings, date, slot, serviceDuration)
        )

        availableSlots.push(...availableSlotsForShift)
      })

      availableSlots = [...new Set(availableSlots)].sort()
    } else {
      const shift = staffShifts.find((s) => s.dayOfWeek === dayOfWeek)
      if (!shift) {
        setAvailableTimes([])
        return
      }

      let slots = generateTimeSlots(shift.startTime, shift.endTime, 30, serviceDuration)

      const bookedForDate = bookedSlots.filter((b) => isSameDay(new Date(b.date), date))
      slots = slots.filter((slot) => !bookedForDate.some((b) => b.startTime === slot))

      availableSlots = slots
    }

    setAvailableTimes(availableSlots)
  }

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Calendar */}
      <div className="p-6 date-picker-container">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Select Date</h3>
        {isLoadingAbsences ? (
          <div className="text-center py-8 text-gray-500">Loading availability...</div>
        ) : (
          <DayPicker
            mode="single"
            selected={reservation.date}
            onSelect={handleDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            fromDate={today}
            toDate={maxDate}
            numberOfMonths={1}
            showOutsideDays={false}
            disabled={(date) => {
              if (isPast(date)) return true
              const dayOfWeek = getDay(date)

              if (isAnyArtist) {
                // Check if ALL staff are either absent or don't work on this day
                const availableStaffForDay = availableStaff.filter((staff) => {
                  // Skip if staff is absent
                  if (isStaffAbsent(staff.id, date, staffAbsences)) return false
                  // Check if staff works on this day
                  return staff.staff_shifts?.some((shift) => shift.dayOfWeek === dayOfWeek)
                })
                return availableStaffForDay.length === 0
              } else if (selectedStaff) {
                // Check if selected staff is absent OR doesn't work on this day
                if (isStaffAbsent(selectedStaff.id, date, staffAbsences)) return true
                return !selectedStaff.staff_shifts?.some((shift) => shift.dayOfWeek === dayOfWeek)
              } else {
                const staffAvailableDays = staffShifts.map((s) => s.dayOfWeek)
                return !staffAvailableDays.includes(dayOfWeek)
              }
            }}
            className="mx-auto"
          />
        )}
      </div>

      {/* Time Slots */}
      {availableTimes.length > 0 && (
        <div className="p-6 border-t">
          <h4 className="text-lg font-semibold mb-3 text-center">Select Time</h4>
          <div className="grid grid-cols-3 gap-2">
            {availableTimes.map((time) => (
              <button
                key={time}
                className={`border rounded py-2 transition-colors hover:bg-blue-50 ${
                  reservation.time === time ? 'bg-blue-200 border-blue-500' : ''
                }`}
                onClick={() => setReservation({ ...reservation, time })}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Available Slots Message */}
      {reservation.date && availableTimes.length === 0 && !isLoadingAbsences && (
        <div className="p-6 text-center text-gray-500">
          No available time slots for the selected date.
          {isAnyArtist && availableStaff.length > 0 && (
            <div className="mt-2 text-sm">
              All staff members are either booked or absent on this day.
            </div>
          )}
          {selectedStaff && isStaffAbsent(selectedStaff.id, reservation.date, staffAbsences) && (
            <div className="mt-2 text-sm text-amber-600">
              {selectedStaff.name} is on leave on this day.
            </div>
          )}
        </div>
      )}

      {/* Custom CSS for DayPicker styling */}
      <style jsx global>{`
        .date-picker-container .rdp {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #3b82f6;
          --rdp-background-color: #eff6ff;
          --rdp-accent-color-dark: #1d4ed8;
          --rdp-background-color-dark: #dbeafe;
          margin: 0;
        }

        .date-picker-container .rdp-months {
          justify-content: center;
        }

        .date-picker-container .rdp-month {
          margin: 0 1rem;
        }

        .date-picker-container .rdp-caption {
          color: #374151;
          font-weight: 600;
          font-size: 1.1rem;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0.5rem 0;
        }

        .date-picker-container .rdp-nav {
          display: flex;
          gap: 0.5rem;
        }

        .date-picker-container .rdp-nav_button {
          color: #374151;
          border: 1px solid #d1d5db;
          background-color: white;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .date-picker-container .rdp-nav_button:hover:not(:disabled) {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }

        .date-picker-container .rdp-nav_button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .date-picker-container .rdp-nav_button svg {
          width: 16px;
          height: 16px;
        }

        .date-picker-container .rdp-table {
          margin-top: 1rem;
        }

        .date-picker-container .rdp-head_cell {
          color: #6b7280;
          font-weight: 600;
          font-size: 0.875rem;
          padding: 0.5rem;
        }

        .date-picker-container .rdp-cell {
          padding: 2px;
        }

        .date-picker-container .rdp-day {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          border: 1px solid transparent;
          color: #374151;
          font-weight: 500;
          transition: all 0.2s;
        }

        .date-picker-container .rdp-day:hover {
          background-color: #f3f4f6;
          border-color: #d1d5db;
        }

        .date-picker-container .rdp-day_selected {
          background-color: #3b82f6 !important;
          color: white !important;
          border-color: #3b82f6;
        }

        .date-picker-container .rdp-day_selected:hover {
          background-color: #1d4ed8 !important;
        }

        .date-picker-container .rdp-day_range_start,
        .date-picker-container .rdp-day_range_end {
          background-color: #3b82f6 !important;
          color: white !important;
        }

        .date-picker-container .rdp-day_range_middle {
          background-color: #eff6ff !important;
          color: #1d4ed8 !important;
        }

        .date-picker-container .rdp-day_disabled {
          color: #d1d5db !important;
          cursor: not-allowed;
        }

        .date-picker-container .rdp-day_outside {
          color: #d1d5db;
        }

        .date-picker-container .rdp-day_today {
          background-color: #fef3c7;
          color: #92400e;
          font-weight: 600;
        }

        .date-picker-container .rdp-day_today:hover {
          background-color: #fde68a;
        }

        .date-picker-container .rdp-dropdown_month,
        .date-picker-container .rdp-dropdown_year {
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          color: #374151;
          font-weight: 500;
        }

        .date-picker-container .rdp-dropdown_month:focus,
        .date-picker-container .rdp-dropdown_year:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  )
}
