'use server'

import { revalidatePath } from 'next/cache'
import { auth, signIn, signOut } from './auth'
import { createBooking, deleteBooking, getBooking, getBookings, updateClient } from './data-service'
import { redirect } from 'next/navigation'
import { supabase } from './supabase'
import { getClientBookings } from '@/app/_lib/data-service'
import {
  sendBookingConfirmationEmail,
  sendBookingNotificationEmail,
  sendBookingUpdateEmail,
  sendBookingUpdateNotificationEmail,
  sendCancellationEmail,
  sendCancellationNotificationEmail,
} from './email-service'
import { addMonths } from 'date-fns'

export async function getStaffAbsences() {
  try {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] // Format: YYYY-MM-DD
    const maxDate = addMonths(today, 3)
    const maxDateStr = maxDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('staff_absences')
      .select('*')
      .gte('absenceDate', todayStr)
      .lte('absenceDate', maxDateStr)

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    // console.error('Error fetching staff absences:', error)
    return { success: false, data: [], error: error.message }
  }
}

export async function updateProfile(formData) {
  try {
    const clientId = parseInt(formData.get('clientId'))
    const fullName = formData.get('fullName')
    const phone = formData.get('phone')

    // Validate
    if (!fullName || !fullName.trim()) {
      return { error: 'Full name is required' }
    }

    // Update in database
    await updateClient(clientId, {
      fullName: fullName.trim(),
      phone: phone?.trim() || null,
    })

    // Revalidate the profile page
    revalidatePath('/account')

    return { success: true }
  } catch (error) {
    // console.error('Error in updateProfile action:', error)
    return { error: error.message }
  }
}

//////////////////////
export async function createAppointment(bookingData, formData) {
  try {
    // Get authenticated session
    const session = await auth()
    if (!session) {
      throw new Error('You must be signed in to create an appointment')
    }

    // Validate required booking data
    if (!bookingData.serviceIds || bookingData.serviceIds.length === 0) {
      throw new Error('At least one service must be selected')
    }

    if (!bookingData.date || !bookingData.time) {
      throw new Error('Date and time must be selected')
    }

    // Extract additional data from formData if needed
    const notes = formData?.get('notes') || bookingData.notes || ''

    // Map artistId to staffId for consistency with database
    let staffId = bookingData.artistId || bookingData.staffId

    // FIXED: Helper function to create timestamp without timezone for PostgreSQL
    const createTimestampWithoutTZ = (date, time, duration = 0) => {
      const [hours, minutes] = time.split(':').map(Number)

      // CRITICAL FIX: Properly extract date components to prevent timezone shifts
      let dateString
      if (date instanceof Date) {
        // Extract local date components (no timezone conversion)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        dateString = `${year}-${month}-${day}`
      } else if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        // Already in YYYY-MM-DD format
        dateString = date
      } else {
        throw new Error(`Invalid date format: ${date}`)
      }

      // Calculate start time
      const startHours = String(hours).padStart(2, '0')
      const startMinutes = String(minutes).padStart(2, '0')

      // Calculate end time
      const totalEndMinutes = minutes + duration
      const endHours = String(hours + Math.floor(totalEndMinutes / 60)).padStart(2, '0')
      const endMinutes = String(totalEndMinutes % 60).padStart(2, '0')

      // Create PostgreSQL timestamp without timezone strings
      // Format: 'YYYY-MM-DD HH:MM:SS' (space separator, not 'T')
      const startTime = `${dateString} ${startHours}:${startMinutes}:00`
      const endTime = `${dateString} ${endHours}:${endMinutes}:00`

      return { dateString, startTime, endTime }
    }

    const { dateString, startTime, endTime } = createTimestampWithoutTZ(
      bookingData.date,
      bookingData.time,
      bookingData.totalDuration
    )

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const bookingDate = new Date(bookingData.date)
    const dayOfWeek = bookingDate.getDay()

    // AUTO-ASSIGN STAFF: If no specific staff was selected, find an available one
    if (!staffId) {
      // Get all staff members with their shifts and services
      const { data: allStaff, error: staffError } = await supabase
        .from('staff')
        .select(
          `
          id,
          name,
          staff_shifts (dayOfWeek, startTime, endTime),
          staff_services (serviceId)
        `
        )
        .order('id', { ascending: false })

      if (staffError) {
        throw new Error('Error fetching staff members: ' + staffError.message)
      }

      if (!allStaff || allStaff.length === 0) {
        throw new Error('No staff members available')
      }

      // Get staff absences for the selected date
      const { data: absences } = await supabase
        .from('staff_absences')
        .select('staffId')
        .eq('absenceDate', dateString)

      const absentStaffIds = absences ? absences.map((a) => a.staffId) : []

      // Check each staff member for availability
      let availableStaff = null

      for (const staff of allStaff) {
        // 1. Check if staff is absent on this date
        if (absentStaffIds.includes(staff.id)) {
          continue
        }

        // 2. Check if staff works on this day of the week
        const shiftsForDay =
          staff.staff_shifts?.filter((shift) => shift.dayOfWeek === dayOfWeek) || []
        if (shiftsForDay.length === 0) {
          continue
        }

        // 3. Check if the booking time falls within any of the staff's shifts
        const [bookingHour, bookingMinute] = bookingData.time.split(':').map(Number)
        const bookingTimeMinutes = bookingHour * 60 + bookingMinute
        const bookingEndMinutes = bookingTimeMinutes + bookingData.totalDuration

        let isWithinShift = false
        for (const shift of shiftsForDay) {
          const [shiftStartHour, shiftStartMinute] = shift.startTime.split(':').map(Number)
          const shiftStartMinutes = shiftStartHour * 60 + shiftStartMinute

          const [shiftEndHour, shiftEndMinute] = shift.endTime.split(':').map(Number)
          const shiftEndMinutes = shiftEndHour * 60 + shiftEndMinute

          // Check if booking time is within shift hours
          if (bookingTimeMinutes >= shiftStartMinutes && bookingEndMinutes <= shiftEndMinutes) {
            isWithinShift = true
            break
          }
        }

        if (!isWithinShift) {
          continue
        }

        // 4. Special rule for staff ID 1: only allow bookings from 12:00 onwards
        if (staff.id === 1 && bookingHour < 12) {
          continue
        }

        // 5. Check if staff can perform all selected services
        const staffServiceIds = staff.staff_services?.map((ss) => ss.serviceId) || []
        const canPerformAllServices = bookingData.serviceIds.every((serviceId) =>
          staffServiceIds.includes(serviceId)
        )

        if (!canPerformAllServices) {
          continue
        }

        // 6. Check for booking conflicts
        const { data: existingBookings, error: conflictError } = await supabase
          .from('bookings')
          .select('id, startTime, endTime, status')
          .eq('staffId', staff.id)
          .eq('date', dateString)
          .in('status', ['pending', 'confirmed'])

        if (conflictError) {
          continue
        }

        // Check if there's any time overlap
        let hasConflict = false

        if (existingBookings && existingBookings.length > 0) {
          for (const booking of existingBookings) {
            const existingStart = booking.startTime
            const existingEnd = booking.endTime

            // Check for overlap: new booking overlaps if it starts before existing ends AND ends after existing starts
            if (startTime < existingEnd && endTime > existingStart) {
              hasConflict = true
              break
            }
          }
        }

        // 7. If all checks pass, this staff member is available!
        if (!hasConflict) {
          availableStaff = staff
          break
        }
      }

      if (!availableStaff) {
        throw new Error(
          'No staff available at the selected date and time. Please choose a different time slot.'
        )
      }

      // Assign the available staff member
      staffId = availableStaff.id
    }

    // Create the booking object matching your database schema
    const newBooking = {
      date: dateString,
      numClients: 1,
      price: bookingData.totalPrice,
      extrasPrice: 0,
      totalPrice: bookingData.totalPrice,
      status: 'pending',
      isPaid: false,
      notes: notes,
      serviceId: bookingData.serviceIds[0],
      serviceIds: bookingData.serviceIds,
      clientId: session.user.clientId,
      staffId: staffId,
      startTime: startTime,
      endTime: endTime,
    }

    // Create a single booking with all services
    const createdBooking = await createBooking(newBooking)

    // Check if booking was created successfully
    if (!createdBooking) {
      throw new Error('Booking was created but no booking object was returned')
    }

    // Fetch services for email
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .in('id', bookingData.serviceIds)

    // Fetch staff for email
    let staffData = null
    if (staffId) {
      const { data: staff } = await supabase.from('staff').select('*').eq('id', staffId).single()

      if (staff) {
        staffData = staff
      }
    }

    // Send confirmation email to customer
    try {
      await sendBookingConfirmationEmail({
        booking: createdBooking,
        clientEmail: session.user.email,
        clientName: session.user.name,
        services: servicesData || [],
        staff: staffData,
      })
    } catch (emailError) {
      // Email error handled silently
    }

    // Send notification email to business
    try {
      await sendBookingNotificationEmail({
        booking: createdBooking,
        businessEmail: 'nailaholics.official@gmail.com',
        clientEmail: session.user.email,
        clientName: session.user.name,
        services: servicesData || [],
        staff: staffData,
      })
    } catch (emailError) {
      // Email error handled silently
    }

    // Revalidate relevant paths
    revalidatePath('/appointments')
    revalidatePath('/booking')

    // Return success with booking ID
    return {
      success: true,
      bookingId: createdBooking.id,
    }
  } catch (error) {
    // Return error instead of throwing
    return {
      success: false,
      error: error.message || 'Failed to create appointment. Please try again.',
    }
  }
}
////////////////////////

export async function deleteReservation(bookingId) {
  try {
    const session = await auth()
    if (!session) {
      throw new Error('You must be signed in to cancel a booking')
    }

    // Security check: Verify the booking belongs to the current user
    const clientBookings = await getClientBookings(session.user.clientId)
    const clientBookingIds = clientBookings.map((booking) => booking.id)

    if (!clientBookingIds.includes(bookingId)) {
      throw new Error("You don't have permission to cancel this booking")
    }

    // Get the booking to check if it can be cancelled
    const booking = clientBookings.find((b) => b.id === bookingId)

    // Check if booking is in the past
    const bookingDate = new Date(booking.startTime || booking.date)
    if (bookingDate < new Date()) {
      throw new Error('Cannot cancel past bookings')
    }

    // Check if booking is at least 24 hours away
    const hoursUntilBooking = (bookingDate - new Date()) / (1000 * 60 * 60)
    if (hoursUntilBooking < 24) {
      throw new Error('Bookings must be cancelled at least 24 hours in advance')
    }

    // Delete the booking from database
    const { error } = await supabase.from('bookings').delete().eq('id', bookingId)

    if (error) {
      // console.error('Supabase delete error:', error)
      throw new Error(`Failed to delete booking: ${error.message}`)
    }

    // Send cancellation email to customer
    try {
      await sendCancellationEmail({
        booking: booking,
        clientEmail: session.user.email,
        clientName: session.user.name,
      })
      // console.log('✅ Customer cancellation email sent successfully')
    } catch (emailError) {
      // console.error('Failed to send customer cancellation email:', emailError)
      // Don't throw - cancellation was successful
    }

    // Send cancellation notification to business
    try {
      await sendCancellationNotificationEmail({
        booking: booking,
        businessEmail: 'nailaholics.official@gmail.com',
        clientEmail: session.user.email,
        clientName: session.user.name,
      })
      // console.log('✅ Business cancellation notification sent successfully')
    } catch (emailError) {
      // console.error('Failed to send business cancellation notification:', emailError)
      // Don't throw - cancellation was successful
    }

    // Revalidate paths to refresh the UI
    revalidatePath('/appointments')

    return { success: true }
  } catch (error) {
    // console.error('Error in deleteReservation:', error)
    throw new Error(error.message || 'Failed to cancel booking')
  }
}

///////////////////////
// Update Reservation //
///////////////////////
export async function updateBooking(updateData) {
  try {
    const session = await auth()
    if (!session) {
      throw new Error('You must be signed in to update a booking')
    }

    const { bookingId, serviceIds, staffId, date, time, totalPrice, totalDuration, notes } =
      updateData

    // Verify the booking belongs to the user
    const existingBooking = await getBooking(bookingId)
    if (!existingBooking || existingBooking.clientId !== session.user.clientId) {
      throw new Error("You don't have permission to update this booking")
    }

    // Check if booking is in the past or cancelled
    const bookingDate = new Date(existingBooking.startTime || existingBooking.date)
    if (bookingDate < new Date()) {
      throw new Error('Cannot update past bookings')
    }

    if (existingBooking.status === 'cancelled') {
      throw new Error('Cannot update cancelled bookings')
    }

    // Map artistId to staffId for consistency
    let assignedStaffId = staffId

    // Create timestamp helper
    const createTimestampWithoutTZ = (date, time, duration = 0) => {
      const [hours, minutes] = time.split(':').map(Number)

      let dateString
      if (date instanceof Date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        dateString = `${year}-${month}-${day}`
      } else {
        dateString = date
      }

      const startHours = String(hours).padStart(2, '0')
      const startMinutes = String(minutes).padStart(2, '0')

      const totalEndMinutes = minutes + duration
      const endHours = String(hours + Math.floor(totalEndMinutes / 60)).padStart(2, '0')
      const endMinutes = String(totalEndMinutes % 60).padStart(2, '0')

      const startTime = `${dateString} ${startHours}:${startMinutes}:00`
      const endTime = `${dateString} ${endHours}:${endMinutes}:00`

      return { dateString, startTime, endTime }
    }

    const { dateString, startTime, endTime } = createTimestampWithoutTZ(date, time, totalDuration)

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const bookingDate2 = new Date(date)
    const dayOfWeek = bookingDate2.getDay()

    // AUTO-ASSIGN STAFF: If no specific staff was selected, find an available one
    if (!assignedStaffId) {
      // Get all staff members with their shifts and services
      const { data: allStaff, error: staffError } = await supabase
        .from('staff')
        .select(
          `
          id,
          name,
          staff_shifts (dayOfWeek, startTime, endTime),
          staff_services (serviceId)
        `
        )
        .order('id', { ascending: false })

      if (staffError) {
        throw new Error('Error fetching staff members: ' + staffError.message)
      }

      if (!allStaff || allStaff.length === 0) {
        throw new Error('No staff members available')
      }

      // Get staff absences for the selected date
      const { data: absences } = await supabase
        .from('staff_absences')
        .select('staffId')
        .eq('absenceDate', dateString)

      const absentStaffIds = absences ? absences.map((a) => a.staffId) : []

      // Check each staff member for availability
      let availableStaff = null

      for (const staff of allStaff) {
        // 1. Check if staff is absent on this date
        if (absentStaffIds.includes(staff.id)) {
          continue
        }

        // 2. Check if staff works on this day of the week
        const shiftsForDay =
          staff.staff_shifts?.filter((shift) => shift.dayOfWeek === dayOfWeek) || []
        if (shiftsForDay.length === 0) {
          continue
        }

        // 3. Check if the booking time falls within any of the staff's shifts
        const [bookingHour, bookingMinute] = time.split(':').map(Number)
        const bookingTimeMinutes = bookingHour * 60 + bookingMinute
        const bookingEndMinutes = bookingTimeMinutes + totalDuration

        let isWithinShift = false
        for (const shift of shiftsForDay) {
          const [shiftStartHour, shiftStartMinute] = shift.startTime.split(':').map(Number)
          const shiftStartMinutes = shiftStartHour * 60 + shiftStartMinute

          const [shiftEndHour, shiftEndMinute] = shift.endTime.split(':').map(Number)
          const shiftEndMinutes = shiftEndHour * 60 + shiftEndMinute

          // Check if booking time is within shift hours
          if (bookingTimeMinutes >= shiftStartMinutes && bookingEndMinutes <= shiftEndMinutes) {
            isWithinShift = true
            break
          }
        }

        if (!isWithinShift) {
          continue
        }

        // 4. Special rule for staff ID 1: only allow bookings from 12:00 onwards
        if (staff.id === 1 && bookingHour < 12) {
          continue
        }

        // 5. Check if staff can perform all selected services
        const staffServiceIds = staff.staff_services?.map((ss) => ss.serviceId) || []
        const canPerformAllServices = serviceIds.every((serviceId) =>
          staffServiceIds.includes(serviceId)
        )

        if (!canPerformAllServices) {
          continue
        }

        // 6. Check for booking conflicts (excluding the current booking being updated)
        const { data: existingBookings, error: conflictError } = await supabase
          .from('bookings')
          .select('id, startTime, endTime, status')
          .eq('staffId', staff.id)
          .eq('date', dateString)
          .neq('id', bookingId) // Exclude the current booking being updated
          .in('status', ['pending', 'confirmed'])

        if (conflictError) {
          continue
        }

        // Check if there's any time overlap
        let hasConflict = false

        if (existingBookings && existingBookings.length > 0) {
          for (const booking of existingBookings) {
            const existingStart = booking.startTime
            const existingEnd = booking.endTime

            // Check for overlap
            if (startTime < existingEnd && endTime > existingStart) {
              hasConflict = true
              break
            }
          }
        }

        // 7. If all checks pass, this staff member is available!
        if (!hasConflict) {
          availableStaff = staff
          break
        }
      }

      if (!availableStaff) {
        throw new Error(
          'No staff available at the selected date and time. Please choose a different time slot.'
        )
      }

      // Assign the available staff member
      assignedStaffId = availableStaff.id
    }

    // Update booking - Keep totalPrice as string to preserve the + sign
    const { data, error } = await supabase
      .from('bookings')
      .update({
        date: dateString,
        serviceId: serviceIds[0],
        serviceIds: serviceIds,
        staffId: assignedStaffId,
        startTime: startTime,
        endTime: endTime,
        price: totalPrice, // Keep as string to preserve + sign
        totalPrice: totalPrice, // Keep as string to preserve + sign
        notes: notes,
        status: 'pending',
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update booking: ${error.message}`)
    }

    // Fetch services for email
    const { data: services } = await supabase.from('services').select('*').in('id', serviceIds)

    // Fetch staff for email
    let staff = null
    if (assignedStaffId) {
      const { data: staffData } = await supabase
        .from('staff')
        .select('*')
        .eq('id', assignedStaffId)
        .single()
      staff = staffData
    }

    // Send update email to customer
    try {
      await sendBookingUpdateEmail({
        booking: data,
        clientEmail: session.user.email,
        clientName: session.user.name,
        services: services || [],
        staff: staff,
      })
    } catch (emailError) {
      // Email error handled silently
    }

    // Send update notification to business
    try {
      await sendBookingUpdateNotificationEmail({
        booking: data,
        businessEmail: 'nailaholics.official@gmail.com',
        clientEmail: session.user.email,
        clientName: session.user.name,
        services: services || [],
        staff: staff,
        previousBooking: existingBooking,
      })
    } catch (emailError) {
      // Email error handled silently
    }

    // Revalidate paths
    revalidatePath('/appointments')

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update booking',
    }
  }
}

///////////////////////
// Sign In / Sign Out //
///////////////////////
export async function signInAction(formData) {
  const callbackUrl = formData.get('callbackUrl') || '/appointments'
  await signIn('google', { redirectTo: callbackUrl })
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' })
}

///////////////////////
///////////////////////

// Helper function to check time slot availability
async function checkTimeSlotAvailability({ date, time, staffId, duration }) {
  try {
    const existingBookings = await getBookingsByDateAndStaff(date, staffId)

    // Convert time to minutes for easier calculation
    const [hours, minutes] = time.split(':').map(Number)
    const appointmentStart = hours * 60 + minutes
    const appointmentEnd = appointmentStart + duration

    // Check for overlaps
    const hasOverlap = existingBookings.some((booking) => {
      const [bookingHours, bookingMinutes] = booking.time.split(':').map(Number)
      const bookingStart = bookingHours * 60 + bookingMinutes
      const bookingEnd = bookingStart + booking.totalDuration

      return appointmentStart < bookingEnd && appointmentEnd > bookingStart
    })

    return !hasOverlap
  } catch (error) {
    // console.error('Error checking time slot availability:', error)
    return false // Err on the side of caution
  }
}

// Helper function to check staff service compatibility
async function checkStaffServiceCompatibility({ staffId, serviceIds }) {
  // If no specific staff selected (staffId is null), return true
  if (!staffId) return true

  try {
    // This should check if the staff member can perform all selected services
    const staffServices = await getStaffServices(staffId)
    const staffServiceIds = staffServices.map((service) => service.id)

    return serviceIds.every((serviceId) => staffServiceIds.includes(serviceId))
  } catch (error) {
    // console.error('Error checking staff service compatibility:', error)
    return false
  }
}

// Helper function to calculate total price server-side
async function calculateTotalPrice(serviceIds) {
  try {
    const services = await getServicesByIds(serviceIds)
    return services.reduce((total, service) => {
      const price = service.discount
        ? service.regularPrice - service.discount
        : service.regularPrice
      return total + price
    }, 0)
  } catch (error) {
    // console.error('Error calculating total price:', error)
    throw new Error('Failed to calculate price')
  }
}

// // Helper function to send confirmation email (optional)
// async function sendBookingConfirmationEmail({ booking, clientEmail, clientName }) {
//   // Implement your email sending logic here
//   // This could use services like SendGrid, Resend, Nodemailer, etc.
//   console.log('Sending confirmation email to:', clientEmail)
// }

// Database functions - implement these according to your database setup
async function getBookingsByDateAndStaff(date, staffId) {
  // TODO: Implement database query to get bookings for specific date and staff
  // For now, return empty array to avoid conflicts
  return []
}

async function getStaffServices(staffId) {
  // TODO: Implement database query to get services that a staff member can perform
  // For now, return empty array (which will make checkStaffServiceCompatibility return false)
  // You might want to return all services temporarily: return [{id: 1}, {id: 2}, {id: 3}]
  return []
}

async function getServicesByIds(serviceIds) {
  // TODO: Implement database query to get service details by IDs
  // For now, return mock data to avoid price validation errors
  return serviceIds.map((id) => ({
    id,
    regularPrice: 50, // Mock price
    discount: 0,
  }))
}

export async function cancelBooking(bookingId) {
  try {
    const session = await auth()
    if (!session) {
      throw new Error('You must be signed in to cancel a booking')
    }

    // Update booking status to cancelled
    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .eq('clientId', session.user.clientId) // Ensure user owns this booking
      .select()
      .single()

    if (error) {
      // console.error('Error cancelling booking:', error)
      throw new Error('Failed to cancel booking')
    }

    // Optional: Send cancellation email
    try {
      await sendCancellationEmail({
        booking: data,
        clientEmail: session.user.email,
        clientName: session.user.name,
      })
    } catch (emailError) {
      // console.error('Failed to send cancellation email:', emailError)
    }

    revalidatePath('/appointments')

    return { success: true }
  } catch (error) {
    // console.error('Error in cancelBooking:', error)
    throw error
  }
}
