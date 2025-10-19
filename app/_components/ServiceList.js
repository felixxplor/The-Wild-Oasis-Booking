import { getServices } from '../_lib/data-service'
import { unstable_noStore } from 'next/cache'
import ServiceCard from '@/app/_components/ServiceCard'
import Link from 'next/link'
import Filter from './Filter'

async function ServiceList({ filter }) {
  unstable_noStore()

  const services = await getServices()

  if (!services) return null

  let displayedServices

  if (filter === 'all') displayedServices = services
  if (filter === 'manicure')
    displayedServices = services.filter((service) => service.category === 'Manicure')
  if (filter === 'pedicure')
    displayedServices = services.filter((service) => service.category === 'Pedicure')
  if (filter === 'acrylic')
    displayedServices = services.filter((service) => service.category === 'Acrylic')
  if (filter === 'biab')
    displayedServices = services.filter((service) => service.category === 'BIAB/Builder Gel')
  if (filter === 'sns') displayedServices = services.filter((service) => service.category === 'SNS')
  if (filter === 'addon')
    displayedServices = services.filter((service) => service.category === 'Add-on Services')
  if (filter === 'waxing')
    displayedServices = services.filter((service) => service.category === 'Waxing')
  if (filter === 'brow-lash')
    displayedServices = services.filter((service) => service.category === 'Brow/Lash')
  if (filter === 'eyelash-extension')
    displayedServices = services.filter((service) => service.category === 'Eyelash Extension')
  if (filter === 'permanent-makeup')
    displayedServices = services.filter((service) => service.category === 'Semi-Permanent Makeup')

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-[clamp(28px,5vw,48px)] font-light leading-[1.2] text-[#414141] mb-6 tracking-[.025em]">
            OUR SERVICES
          </h1>
          <p className="text-[clamp(14px,2vw,18px)] text-[#414141] max-w-2xl mx-auto leading-relaxed tracking-[.01em]">
            Indulge in our comprehensive range of professional nail and beauty treatments, designed
            to help you look and feel your absolute best
          </p>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <Filter />
      </div>

      {/* Services Grid */}
      <div className="pb-16 sm:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            {displayedServices?.map((service) => (
              <ServiceCard service={service} key={service.id} />
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-[clamp(20px,4vw,32px)] font-light leading-[1.3] text-[#414141] mb-6 tracking-[.025em]">
            Ready to Treat Yourself?
          </h2>
          <p className="text-[#414141] text-sm sm:text-base mb-8 max-w-2xl mx-auto leading-relaxed tracking-[.01em]">
            Book your appointment today and experience our premium nail and beauty services in our
            relaxing, professional environment.
          </p>
          <Link href="/booking">
            <button className="text-[#414141] bg-transparent border border-[#414141] text-[10px] sm:text-xs tracking-[.22em] h-[45px] sm:h-[50px] min-w-[160px] sm:min-w-[200px] px-8 sm:px-10 transition duration-300 hover:bg-[#414141] hover:text-white">
              BOOK APPOINTMENT
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ServiceList
