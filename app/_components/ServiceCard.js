import { ClockIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

function ServiceCard({ service }) {
  const { id, name, duration, regularPrice, discount, description } = service

  return (
    <div className="group overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-4 sm:p-5">
        <div className="mb-4">
          <h3 className="text-[#414141] text-lg sm:text-xl font-light mb-2 tracking-[.025em]">
            {name}
          </h3>

          <div className="flex items-center gap-1.5 mb-3 text-[#9d9d9c]">
            <ClockIcon className="h-3.5 w-3.5" />
            <p className="text-xs tracking-[.025em]">{duration} min</p>
          </div>

          <p className="text-[#414141] text-xs leading-relaxed tracking-[.01em] line-clamp-2">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#e8e0db]">
          <div className="flex items-baseline gap-1.5">
            {discount > 0 ? (
              <>
                <span className="text-xl sm:text-2xl font-light text-[#414141]">
                  ${regularPrice - discount}
                </span>
                <span className="line-through text-[#9d9d9c] text-xs">${regularPrice}</span>
              </>
            ) : (
              <span className="text-xl sm:text-2xl font-light text-[#414141]">${regularPrice}</span>
            )}
          </div>

          <Link href={`/booking?service=${id}`}>
            <button className="text-[#414141] bg-transparent border border-[#414141] text-[10px] tracking-[.2em] h-[32px] min-w-[85px] px-3 transition duration-300 hover:bg-[#414141] hover:text-white">
              BOOK
            </button>
          </Link>
        </div>
      </div>

      {discount > 0 && (
        <div className="bg-[#414141] text-white px-2 py-1 text-[10px] text-center tracking-[.1em]">
          SAVE ${discount}
        </div>
      )}
    </div>
  )
}

export default ServiceCard
