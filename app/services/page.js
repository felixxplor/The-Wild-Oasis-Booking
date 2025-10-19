import { Suspense } from 'react'
import Spinner from '../_components/Spinner'
import Filter from '../_components/Filter'
import ServiceList from '../_components/ServiceList'

export const revalidate = 3600

export const metadata = {
  title: 'Services',
}

export default function Page({ searchParams }) {
  const filter = searchParams?.category ?? 'all'

  return (
    <div>
      <h1 className="text-4xl mb-5 text-accent-400 font-medium">Our Services</h1>

      <Suspense fallback={<Spinner />} key={filter}>
        <ServiceList filter={filter} />
      </Suspense>
    </div>
  )
}
