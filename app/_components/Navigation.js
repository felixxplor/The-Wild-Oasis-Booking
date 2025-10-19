import Image from 'next/image'
import Link from 'next/link'

export default function Navigation({ handleToggle, session }) {
  return (
    <nav className="flex justify-between items-center bg-white px-4 sm:px-6 md:px-8 py-4 fixed top-0 left-0 w-full z-20">
      {/* Left Navigation */}
      <div className="flex-1 flex justify-start">
        {/* Mobile Menu Button */}
        <div className="hidden lg:block">
          <button className="h-8 bg-transparent text-[#414141] text-xs tracking-widest hover:text-gray-400 transition-colors hidden">
            ☰ Menu
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="flex">
          <Link
            href="/"
            onClick={handleToggle}
            className="text-[#414141] text-xs tracking-widest no-underline my-2.5 mr-6 hover:text-gray-400 transition-colors"
          >
            HOME
          </Link>
          <Link
            href="/services"
            onClick={handleToggle}
            className="text-[#414141] text-xs tracking-widest no-underline my-2.5 mr-6 hover:text-gray-400 transition-colors"
          >
            SERVICES
          </Link>
          {/* <Link
            href="/shop"
            onClick={handleToggle}
            className="text-[#414141] text-xs tracking-widest no-underline my-2.5 mr-6 hover:text-gray-400 transition-colors"
          >
            SHOP
          </Link> */}
          <Link
            href="/aftercare"
            onClick={handleToggle}
            className="text-[#414141] text-xs tracking-widest no-underline my-2.5 mr-6 hover:text-gray-400 transition-colors"
          >
            AFTERCARE
          </Link>
          <Link
            href="/contact"
            onClick={handleToggle}
            className="text-[#414141] text-xs tracking-widest no-underline my-2.5 hover:text-gray-400 transition-colors"
          >
            CONTACT
          </Link>
        </div>
      </div>

      {/* Center Logo */}
      <div className="flex-1 flex justify-center">
        <Link
          href="/"
          className="text-[#414141] text-xs tracking-widest no-underline hover:text-gray-400 transition-colors"
        >
          NAILAHOLICS
        </Link>
      </div>

      {/* Right Navigation */}
      <div className="flex-1 flex justify-end items-center">
        {/* Book Now Button - Hidden on Mobile */}
        <Link
          href="/booking"
          className="text-[#414141] text-xs tracking-widest no-underline ml-6 hover:text-gray-400 transition-colors"
        >
          BOOK NOW
        </Link>

        {/* Calendar Icon - Shown on Mobile */}
        {/* <Link
          href="/cart"
          className="hidden sm:block text-[#414141] text-xs tracking-widest no-underline ml-6 hover:text-gray-400 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
        </Link> */}
        {/* Profile Icon */}
        <Link
          href={session ? '/appointments/' : '/login'}
          className="text-[#414141] text-xs tracking-widest ml-6 hover:text-gray-400 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </Link>
      </div>
    </nav>
  )
}
