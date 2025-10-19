import { eachDayOfInterval } from 'date-fns'

import { supabase } from './supabase'
import { notFound } from 'next/navigation'

/////////////
// GET

export const getStaffFullInfo = async function () {
  const { data, error } = await supabase.from('staff').select(`
      id,
      name,
      staff_services (
        serviceId,
        services (
          id,
          name,
          duration,
          regularPrice
        )
      ),
      staff_shifts (
        dayOfWeek,
        startTime,
        endTime
      ),
      bookings (
        id,
        date,
        startTime,
        endTime,
        serviceId
      )
    `)

  if (error) {
    console.error(error)
    throw new Error('Staff full info could not be loaded')
  }

  return data
}

/////////////

export async function getService(id) {
  let { data, error } = await supabase.from('services').select('*')

  // For testing
  // await new Promise((res) => setTimeout(res, 2000));

  if (error) {
    console.error(error)
    notFound()
  }

  return data
}

export async function getCabinPrice(id) {
  const { data, error } = await supabase
    .from('cabins')
    .select('regularPrice, discount')
    .eq('id', id)
    .single()

  if (error) {
    console.error(error)
  }

  return data
}

export const getServices = async function () {
  const { data, error } = await supabase
    .from('services')
    .select('id, name, regularPrice, discount, image, description, duration, category')
    .order('name')

  // For testing
  // await new Promise((res) => setTimeout(res, 1000));

  if (error) {
    console.error(error)
    throw new Error('Services could not be loaded')
  }

  return data
}

// Clients are uniquely identified by their email address
export async function getClient(email) {
  const { data, error } = await supabase.from('client').select('*').eq('email', email).single()

  // No error here! We handle the possibility of no clients in the sign in callback
  return data
}

export async function getBooking(id) {
  const { data, error, count } = await supabase.from('bookings').select('*').eq('id', id).single()

  if (error) {
    console.error(error)
    throw new Error('Booking could not get loaded')
  }

  return data
}

export async function getBookings(clientId) {
  const { data, error, count } = await supabase
    .from('bookings')
    // We actually also need data on the cabins as well. But let's ONLY take the data that we actually need, in order to reduce downloaded data.
    .select(
      'id, created_at, startDate, endDate, totalPrice, clientId, serviceId, services(name, image)'
    )
    .eq('clientId', clientId)
    .order('startDate')

  if (error) {
    console.error(error)
    throw new Error('Bookings could not get loaded')
  }

  return data
}

export async function getClientBookings(clientId) {
  if (!clientId) {
    console.error('No clientId provided to getClientBookings')
    throw new Error('Client ID is required')
  }

  console.log('Fetching bookings for clientId:', clientId)

  try {
    // Fetch bookings with staff relation (only select columns that exist)
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(
        `
        *,
        staff:staffId (
          id,
          name
        )
      `
      )
      .eq('clientId', clientId)
      .order('date', { ascending: false })

    if (bookingsError) {
      console.error('Supabase error fetching bookings:', bookingsError)
      throw new Error(`Database error: ${bookingsError.message}`)
    }

    if (!bookings || bookings.length === 0) {
      console.log('No bookings found for this client')
      return []
    }

    console.log('Successfully fetched bookings:', bookings.length)

    // Extract all unique service IDs from all bookings
    const allServiceIds = [
      ...new Set(
        bookings.flatMap((booking) => {
          // serviceIds is a JSONB array, so we need to handle it carefully
          if (Array.isArray(booking.serviceIds)) {
            return booking.serviceIds
          }
          // Fallback to single serviceId if serviceIds is not available
          if (booking.serviceId) {
            return [booking.serviceId]
          }
          return []
        })
      ),
    ]

    console.log('Fetching services for IDs:', allServiceIds)

    // Fetch all services in one query
    let servicesData = []
    if (allServiceIds.length > 0) {
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, name, description, duration, regularPrice, discount')
        .in('id', allServiceIds)

      if (servicesError) {
        console.error('Error fetching services:', servicesError)
        // Don't throw here, just log and continue without services
      } else {
        servicesData = services || []
      }
    }

    console.log('Fetched services:', servicesData.length)

    // Manually join services to bookings
    const enrichedBookings = bookings.map((booking) => {
      let bookingServices = []

      // Get service IDs for this booking
      if (Array.isArray(booking.serviceIds)) {
        bookingServices = booking.serviceIds
          .map((serviceId) => servicesData.find((s) => s.id === serviceId))
          .filter(Boolean) // Remove any undefined values
      } else if (booking.serviceId) {
        // Fallback to single service
        const service = servicesData.find((s) => s.id === booking.serviceId)
        if (service) bookingServices = [service]
      }

      return {
        ...booking,
        services: bookingServices,
      }
    })

    return enrichedBookings
  } catch (err) {
    console.error('Error in getClientBookings:', err)
    throw err
  }
}

export async function getBookedDatesByServiceId(serviceId) {
  let today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  today = today.toISOString()

  // Getting all bookings
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('serviceId', serviceId)
    .or(`date.gte.${today},status.eq.checked-in`)

  if (error) {
    console.error(error)
    throw new Error('Bookings could not get loaded')
  }

  // Converting to actual dates to be displayed in the date picker
  const bookedDates = data.map((booking) => new Date(booking.date))

  return bookedDates
}

export async function getSettings() {
  const { data, error } = await supabase.from('settings').select('*').single()

  // For testing
  // await new Promise((res) => setTimeout(res, 5000));

  if (error) {
    console.error(error)
    throw new Error('Settings could not be loaded')
  }

  return data
}

export async function getCountries() {
  try {
    const res = await fetch('https://restcountries.com/v2/all?fields=name,flag')
    const countries = await res.json()
    return countries
  } catch {
    throw new Error('Could not fetch countries')
  }
}

/////////////
// CREATE

export async function createClient(newClient) {
  const { data, error } = await supabase.from('client').insert([newClient])

  if (error) {
    console.error(error)
    throw new Error('Client could not be created')
  }

  return data
}

export async function createBooking(newBooking) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([newBooking])
    .select() // Add this to return the created record
    .single() // Add this to return a single object instead of array

  if (error) {
    console.error('Supabase error:', error)
    throw new Error('Booking could not be created')
  }

  return data // Return the created booking instead of null
}

/////////////
// UPDATE

// The updatedFields is an object which should ONLY contain the updated data
export async function updateClient(id, updatedFields) {
  const { data, error } = await supabase
    .from('client')
    .update(updatedFields)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(error)
    throw new Error('Client could not be updated')
  }
  return data
}

export async function updateBooking(id, updatedFields) {
  const { data, error } = await supabase
    .from('bookings')
    .update(updatedFields)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(error)
    throw new Error('Booking could not be updated')
  }
  return data
}

/////////////
// DELETE

export async function deleteBooking(id) {
  const { data, error } = await supabase.from('bookings').delete().eq('id', id)

  if (error) {
    console.error(error)
    throw new Error('Booking could not be deleted')
  }
  return data
}
