import { Suspense } from 'react'
import { auth } from '@/app/_lib/auth'
import { redirect } from 'next/navigation'
import { getServices, getStaffFullInfo } from '@/app/_lib/data-service'
import BookingSummaryPage from '@/app/_components/BookingSummaryPage'

export const metadata = {
  title: 'Booking Summary | NAILAHOLICS',
  description: 'Review and confirm your booking',
}

function SummaryLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your booking...</p>
      </div>
    </div>
  )
}

async function SummaryContent({ searchParams }) {
  const session = await auth()

  // Redirect to login if not authenticated
  if (!session?.user) {
    const params = new URLSearchParams(searchParams)
    redirect(`/login?redirect=/booking-summary&${params.toString()}`)
  }

  // Get services and staff data
  const services = await getServices()
  const staffData = await getStaffFullInfo()

  // Parse URL params
  const selectedServiceIds = searchParams.services
    ? searchParams.services.split(',').map((id) => parseInt(id))
    : []
  const selectedArtist = searchParams.artist || null
  const dateStr = searchParams.date || null
  const time = searchParams.time || null

  // Redirect to booking if no services selected
  if (selectedServiceIds.length === 0) {
    redirect('/booking')
  }

  // Get selected service objects
  const selectedServiceObjects = services.filter((service) =>
    selectedServiceIds.includes(service.id)
  )

  // Filter available staff based on selected services
  const availableStaff = staffData.filter((staff) => {
    const staffServiceIds = staff.staff_services?.map((ss) => ss.serviceId)
    return selectedServiceObjects.every((service) => staffServiceIds.includes(service.id))
  })

  // Calculate totals
  let totalPriceNum = 0
  let hasPlus = false

  selectedServiceObjects.forEach((service) => {
    const priceStr = String(
      service.discount ? service.regularPrice - service.discount : service.regularPrice
    )
    if (priceStr.includes('+')) {
      hasPlus = true
    }
    const numericPrice = parseFloat(priceStr.replace('+', ''))
    totalPriceNum += numericPrice
  })

  const totalPrice = hasPlus ? `${totalPriceNum}+` : totalPriceNum
  const totalDuration = selectedServiceObjects.reduce((sum, service) => sum + service.duration, 0)

  return (
    <BookingSummaryPage
      selectedServices={selectedServiceIds}
      selectedArtist={selectedArtist}
      availableStaff={availableStaff}
      services={services}
      session={session}
      totalPrice={totalPrice}
      totalDuration={totalDuration}
      dateStr={dateStr}
      time={time}
    />
  )
}

export default function BookingSummaryRoute({ searchParams }) {
  return (
    <Suspense fallback={<SummaryLoading />}>
      <SummaryContent searchParams={searchParams} />
    </Suspense>
  )
}
