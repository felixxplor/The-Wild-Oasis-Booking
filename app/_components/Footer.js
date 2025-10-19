import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#f3ede8] text-[10px] md:text-xs tracking-[.22em] py-6 md:py-10 px-4 md:px-16 text-center mt-8 md:mt-12">
      <div className="flex justify-around">
        {/* Navigation Column */}
        <div className="w-1/3 border-r border-[#414141]">
          <div className="text-[#9d9d9c] mb-4 md:mb-6">NAVIGATION</div>
          <ul className="list-none m-0 p-0">
            {/* <li className="leading-6">
              <Link href="/aftercare" className="text-[#414141] no-underline hover:text-gray-500">
                AFTERCARE
              </Link>
            </li> */}
            <li className="leading-6">
              <Link href="/login" className="text-[#414141] no-underline hover:text-gray-500">
                LOGIN
              </Link>
            </li>
            <li className="leading-6">
              <Link href="/services" className="text-[#414141] no-underline hover:text-gray-500">
                PRICES
              </Link>
            </li>
            <li className="leading-6">
              <Link href="/booking" className="text-[#414141] no-underline hover:text-gray-500">
                BOOK ONLINE
              </Link>
            </li>
          </ul>
        </div>

        {/* More Column */}
        <div className="w-1/3 border-r border-[#414141]">
          <div className="text-[#9d9d9c] mb-4 md:mb-6">MORE</div>
          <ul className="list-none m-0 p-0">
            <li className="leading-6">
              <Link href="/" className="text-[#414141] no-underline hover:text-gray-500">
                HOME
              </Link>
            </li>
            <li className="leading-6">
              <Link href="/aftercare" className="text-[#414141] no-underline hover:text-gray-500">
                AFTERCARE
              </Link>
            </li>
            <li className="leading-6">
              <Link href="/services" className="text-[#414141] no-underline hover:text-gray-500">
                SERVICES
              </Link>
            </li>
            {/* <li className="leading-6">
              <Link href="/careers" className="text-[#414141] no-underline hover:text-gray-500">
                CAREERS
              </Link>
            </li> */}
          </ul>
        </div>

        {/* nailaholics.mortdale Column */}
        <div className="w-1/3">
          <div className="text-[#9d9d9c] mb-4 md:mb-6">NAILAHOLICS</div>
          <ul className="list-none m-0 p-0">
            {/* <li className="leading-6">
              <Link href="/about" className="text-[#414141] no-underline hover:text-gray-500">
                ABOUT US
              </Link>
            </li> */}
            <li className="leading-6">
              <Link href="/contact" className="text-[#414141] no-underline hover:text-gray-500">
                CONTACT US
              </Link>
            </li>
            <li className="leading-6">
              <a href="#" className="text-[#414141] no-underline hover:text-gray-500">
                FACEBOOK
              </a>
            </li>
            <li className="leading-6">
              <a
                href="https://www.instagram.com/nailaholics.mortdale/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#414141] no-underline hover:text-gray-500"
              >
                INSTAGRAM
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-[6px] md:text-[8px] mt-6">
        {`COPYRIGHT © ${new Date().getFullYear()} Nailaholics Nails & Beauty - Powered by Wonder8 Marketing`}
      </div>
    </footer>
  )
}
