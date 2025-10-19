'use client'

import Navigation from '@/app/_components/Navigation'
import Logo from '@/app/_components/Logo'
import { useState } from 'react'
import Link from 'next/link'

function NavToggle({ session }) {
  const [isOpen, setIsOpen] = useState(false)

  function handleToggle() {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Your Original Desktop Header (unchanged) */}
      <header className="flex justify-between items-center bg-white fixed top-0 left-0 w-full z-[2]">
        <Navigation handleToggle={handleToggle} session={session} />
        <Logo handleToggle={handleToggle} />
        <div className="hidden sm:flex justify-end flex-1 flex-wrap gap-6">
          <Link
            href="/booking"
            className="text-[#414141] text-xs tracking-[.22em] hover:text-gray-400"
          >
            BOOK NOW
          </Link>
          <Link href="/booking" className="text-[#414141] hover:text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-calendar-event"
              viewBox="0 0 16 16"
            >
              <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z" />
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
            </svg>
          </Link>
          <Link href="/cart" className="text-[#414141] hover:text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </Link>
          <Link href="/appointments" className="text-[#414141] hover:text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </Link>
        </div>
      </header>

      {/* NEW: Mobile Header (only for screens < 1024px) */}
      <header className="hidden max-[1024px]:flex justify-between items-center fixed top-0 left-0 w-full z-40 bg-white py-3 px-4 sm:px-6 md:px-8">
        <button
          title="Menu"
          onClick={handleToggle}
          className="bg-white text-[#414141] text-[12px] tracking-[.22em] border border-[#414141] h-[30px] bg-transparent px-3 flex items-center hover:bg-blue-50"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 16 16">
            <path
              fillRule="evenodd"
              d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
            />
          </svg>
          Menu
        </button>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className="text-[#414141] text-[12px] tracking-[.22em]">
            NAILAHOLICS
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/booking" className="text-[#414141] hover:text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-calendar-event"
              viewBox="0 0 16 16"
            >
              <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z" />
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
            </svg>
          </Link>
          <Link href="/appointments" className="text-[#414141] hover:text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </Link>
        </div>
      </header>

      {/* Mobile Menu Slide */}
      <div
        className={`max-[1024px]:block hidden fixed top-0 left-0 h-full bg-white z-50 transition-all duration-500 font-['FreightDisp_Pro'] text-[#414141] tracking-[.025em] ${
          isOpen ? 'w-80 shadow-lg' : 'w-0'
        } overflow-x-hidden pt-[60px]`}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            handleToggle()
          }}
          className="absolute top-0 -left-6 text-4xl ml-[50px] no-underline text-[#414141]"
        >
          &times;
        </a>
        <div className="px-[60px] flex flex-col">
          <h3 className="mb-10">Menu</h3>
          <Link
            href="/"
            className="text-[#414141] no-underline mb-5 hover:text-gray-400"
            onClick={handleToggle}
          >
            HOME
          </Link>
          <Link
            href="/services"
            className="text-[#414141] no-underline mb-5 hover:text-gray-400"
            onClick={handleToggle}
          >
            SERVICES
          </Link>
          <Link
            href="/booking"
            className="text-[#414141] no-underline mb-5 hover:text-gray-400"
            onClick={handleToggle}
          >
            BOOK NOW
          </Link>
          {session ? (
            <Link
              href="/appointments"
              className="text-[#414141] no-underline mb-5 hover:text-gray-400"
              onClick={handleToggle}
            >
              MY APPOINTMENTS
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-[#414141] no-underline mb-5 hover:text-gray-400"
              onClick={handleToggle}
            >
              LOGIN
            </Link>
          )}
          <Link
            href="/aftercare"
            className="text-[#414141] no-underline mb-5 hover:text-gray-400"
            onClick={handleToggle}
          >
            AFTERCARE
          </Link>
          <Link
            href="/contact"
            className="text-[#414141] no-underline mb-5 hover:text-gray-400"
            onClick={handleToggle}
          >
            CONTACT
          </Link>
        </div>
      </div>

      {/* Overlay */}
      <div
        onClick={handleToggle}
        className={`max-[1024px]:block hidden fixed right-0 top-0 h-full z-40 transition-all duration-500 bg-black ${
          isOpen ? 'w-full opacity-50' : 'w-0 opacity-0'
        }`}
      />
    </>
  )
}

export default NavToggle
