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
    const staffId = bookingData.artistId || bookingData.staffId

    // Helper function to create timestamp without timezone for PostgreSQL
    const createTimestampWithoutTZ = (date, time, duration = 0) => {
      const [hours, minutes] = time.split(':').map(Number)

      // Convert Date object to date string if needed
      let dateString
      if (date instanceof Date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        dateString = `${year}-${month}-${day}`
      } else {
        dateString = date // Already a string in YYYY-MM-DD format
      }

      // Calculate start time
      const startHours = String(hours).padStart(2, '0')
      const startMinutes = String(minutes).padStart(2, '0')

      // Calculate end time
      const totalEndMinutes = minutes + duration
      const endHours = String(hours + Math.floor(totalEndMinutes / 60)).padStart(2, '0')
      const endMinutes = String(totalEndMinutes % 60).padStart(2, '0')

      // Create PostgreSQL timestamp without timezone strings
      const startTime = `${dateString} ${startHours}:${startMinutes}:00`
      const endTime = `${dateString} ${endHours}:${endMinutes}:00`

      return { dateString, startTime, endTime }
    }

    const { dateString, startTime, endTime } = createTimestampWithoutTZ(
      bookingData.date,
      bookingData.time,
      bookingData.totalDuration
    )

    // console.log('Creating timestamps:', {
    //   originalDate: bookingData.date,
    //   originalTime: bookingData.time,
    //   duration: bookingData.totalDuration,
    //   dateString: dateString,
    //   calculatedStartTime: startTime,
    //   calculatedEndTime: endTime,
    // })

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

    // console.log('Creating booking with data:', newBooking)

    // Create a single booking with all services
    const createdBooking = await createBooking(newBooking)

    // Check if booking was created successfully
    if (!createdBooking) {
      throw new Error('Booking was created but no booking object was returned')
    }

    // console.log('Booking created successfully:', createdBooking)

    // Fetch services for email
    // console.log('📧 Fetching services for email, IDs:', bookingData.serviceIds)

    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .in('id', bookingData.serviceIds)

    if (servicesError) {
      // console.error('❌ Error fetching services for email:', servicesError)
    } else {
      // console.log('✅ Services fetched for email:', servicesData)
    }

    // Fetch staff for email
    let staffData = null
    if (staffId) {
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('id', staffId)
        .single()

      if (staffError) {
        // console.error('❌ Error fetching staff for email:', staffError)
      } else {
        staffData = staff
        // console.log('✅ Staff fetched for email:', staffData?.name)
      }
    }

    // Send confirmation email to customer
    // console.log('📧 Attempting to send confirmation email to customer...')
    // console.log('📧 Email data prepared:', {
    //   hasBooking: !!createdBooking,
    //   hasServices: !!servicesData && servicesData.length > 0,
    //   hasClientEmail: !!session.user.email,
    //   hasClientName: !!session.user.name,
    //   clientEmail: session.user.email,
    //   clientName: session.user.name,
    // })

    try {
      await sendBookingConfirmationEmail({
        booking: createdBooking,
        clientEmail: session.user.email,
        clientName: session.user.name,
        services: servicesData || [],
        staff: staffData,
      })
      // console.log('✅ Customer confirmation email sent successfully')
    } catch (emailError) {
      // console.error('❌ Failed to send customer confirmation email:', emailError)
      // console.error('❌ Email error details:', emailError.message)
    }

    // Send notification email to business
    // console.log('📧 Attempting to send notification email to business...')
    try {
      await sendBookingNotificationEmail({
        booking: createdBooking,
        businessEmail: 'nailaholics.official@gmail.com',
        clientEmail: session.user.email,
        clientName: session.user.name,
        services: servicesData || [],
        staff: staffData,
      })
      // console.log('✅ Business notification email sent successfully')
    } catch (emailError) {
      // console.error('❌ Failed to send business notification email:', emailError)
      // console.error('❌ Email error details:', emailError.message)
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
    // console.error('Error creating appointment:', error)

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

    // console.log('Updating booking with timestamps:', {
    //   dateString,
    //   startTime,
    //   endTime,
    // })

    // Update booking
    const { data, error } = await supabase
      .from('bookings')
      .update({
        date: dateString,
        serviceId: serviceIds[0],
        serviceIds: serviceIds,
        staffId: staffId || null,
        startTime: startTime,
        endTime: endTime,
        price: totalPrice,
        totalPrice: totalPrice,
        notes: notes,
        status: 'pending',
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      // console.error('Error updating booking:', error)
      throw new Error(`Failed to update booking: ${error.message}`)
    }

    // Fetch services for email
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .in('id', updateData.serviceIds)

    // Fetch staff for email
    let staff = null
    if (updateData.staffId) {
      const { data: staffData } = await supabase
        .from('staff')
        .select('*')
        .eq('id', updateData.staffId)
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
      // console.log('✅ Customer update email sent successfully')
    } catch (emailError) {
      // console.error('Failed to send customer update email:', emailError)
      // Don't throw - update was successful
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
        previousBooking: existingBooking, // Optional: to show what changed
      })
      // console.log('✅ Business update notification sent successfully')
    } catch (emailError) {
      // console.error('Failed to send business update notification:', emailError)
      // Don't throw - update was successful
    }

    // console.log('Booking updated successfully:', data)

    // Revalidate paths
    revalidatePath('/appointments')

    return { success: true }
  } catch (error) {
    // console.error('Error in updateBooking:', error)
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
