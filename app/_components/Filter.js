'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

function Filter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeFilter = searchParams.get('category') ?? 'all'

  function handleFilter(filter) {
    const params = new URLSearchParams()
    params.set('category', filter)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex bg-white shadow-sm rounded-sm w-max mx-auto">
          <Button filter="all" handleFilter={handleFilter} activeFilter={activeFilter}>
            All Services
          </Button>
          <Button filter="manicure" handleFilter={handleFilter} activeFilter={activeFilter}>
            Manicure
          </Button>
          <Button filter="pedicure" handleFilter={handleFilter} activeFilter={activeFilter}>
            Pedicure
          </Button>
          <Button filter="acrylic" handleFilter={handleFilter} activeFilter={activeFilter}>
            Acrylic
          </Button>
          <Button filter="biab" handleFilter={handleFilter} activeFilter={activeFilter}>
            BIAB/Builder Gel
          </Button>
          <Button filter="sns" handleFilter={handleFilter} activeFilter={activeFilter}>
            SNS
          </Button>
          <Button filter="addon" handleFilter={handleFilter} activeFilter={activeFilter}>
            Add-on Services
          </Button>
          <Button filter="waxing" handleFilter={handleFilter} activeFilter={activeFilter}>
            Waxing
          </Button>
          <Button filter="brow-lash" handleFilter={handleFilter} activeFilter={activeFilter}>
            Brow/Lash
          </Button>
          <Button
            filter="eyelash-extension"
            handleFilter={handleFilter}
            activeFilter={activeFilter}
          >
            Eyelash Extension
          </Button>
          <Button filter="permanent-makeup" handleFilter={handleFilter} activeFilter={activeFilter}>
            Semi-Permanent Makeup
          </Button>
        </div>
      </div>
    </div>
  )
}

function Button({ filter, handleFilter, activeFilter, children }) {
  const isActive = filter === activeFilter

  return (
    <button
      onClick={() => handleFilter(filter)}
      className={`
        relative px-4 sm:px-6 py-2 sm:py-3 text-xs tracking-[.15em] font-medium transition-all duration-300 border-r border-[#e8e0db] last:border-r-0 whitespace-nowrap
        ${
          isActive
            ? 'bg-[#414141] text-white'
            : 'text-[#414141] hover:bg-[#f3ede8] hover:text-[#414141]'
        }
      `}
    >
      {children}
    </button>
  )
}

export default Filter
