// BookingPageWrapper.js (Server Component)
import { Suspense } from 'react'
import {
  getBookedDatesByServiceId,
  getServices,
  getSettings,
  getStaffFullInfo,
} from '../_lib/data-service'
import Spinner from '../_components/Spinner'
import BookingPage from '../_components/BookingPageClient'
import { auth } from '../_lib/auth'

export const revalidate = 3600

async function BookingPageWrapper({}) {
  const services = await getServices()
  const [settings, bookedDates] = await Promise.all([
    // getSettings(),
    // getBookedDatesByServiceId(services.id),
  ])
  const session = await auth()
  const staffData = await getStaffFullInfo()

  return (
    <div>
      <h1 className="text-4xl mb-5 text-accent-400 font-medium">Our Services</h1>

      <Suspense fallback={<Spinner />}>
        <BookingPage
          settings={settings}
          bookedDates={bookedDates}
          services={services}
          staffData={staffData}
          session={session}
        />
      </Suspense>
    </div>
  )
}

export default BookingPageWrapper
