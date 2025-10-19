import Image from 'next/image'
import Link from 'next/link'
import hero from '@/public/hero.png'
import section1 from '@/public/section1.jpg'
import section2 from '@/public/section2.jpeg'
import ig1 from '@/public/ig1.png'
import ig2 from '@/public/ig2.png'
import ig3 from '@/public/ig3.png'
import ig4 from '@/public/ig4.png'
import ig5 from '@/public/ig5.png'
import ig6 from '@/public/ig6.png'
import ig7 from '@/public/ig7.png'
import ig8 from '@/public/ig8.png'
import blog1 from '@/public/blog1.jpg'
import blog2 from '@/public/blog2.jpg'

export default function Page() {
  const instagramPosts = [
    {
      id: 1,
      imageUrl: ig1,
      link: 'https://www.instagram.com/p/Cpz2TsEyUdR/',
      alt: 'Instagram post 1',
    },
    {
      id: 2,
      imageUrl: ig8,
      link: 'https://www.instagram.com/p/CVbklDQBn4C/',
      alt: 'Instagram post 2',
    },
    {
      id: 3,
      imageUrl: ig5,
      link: 'https://www.instagram.com/p/CRBe-kdn7Ow/',
      alt: 'Instagram post 3',
    },
    {
      id: 4,
      imageUrl: ig4,
      link: 'https://www.instagram.com/p/ClBahixSU2I/',
      alt: 'Instagram post 4',
    },
    {
      id: 5,
      imageUrl: ig3,
      link: 'https://www.instagram.com/p/CXV29yalt3-/',
      alt: 'Instagram post 5',
    },
    {
      id: 6,
      imageUrl: ig6,
      link: 'https://www.instagram.com/p/CXV29yalt3-/',
      alt: 'Instagram post 6',
    },
    {
      id: 7,
      imageUrl: ig7,
      link: 'https://www.instagram.com/p/CaGcy-OPKDb/',
      alt: 'Instagram post 7',
    },
    {
      id: 8,
      imageUrl: ig2,
      link: 'https://www.instagram.com/p/CXV2zThlUE2/',
      alt: 'Instagram post 8',
    },
  ]

  return (
    <>
      {/* Hero */}
      <div className="relative pt-[60px] sm:pt-[74px] pb-10">
        <div className="relative w-full aspect-[2/1] min-h-[300px] sm:min-h-[420px]">
          <Image
            src={hero}
            alt="Hero background"
            fill
            priority
            className="object-cover opacity-90 brightness-50"
          />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white max-w-[490px] px-6">
          <p className="text-[clamp(14px,3.5vw,40px)] leading-[1.1] mb-4 sm:mb-6">
            Give yourself a little pampering. Relax, sit back, get your nails and eyelashes done —
            we got you!
          </p>
          <Link href="/booking">
            <button className="text-white bg-transparent border border-white text-[10px] sm:text-xs tracking-[.22em] h-[40px] sm:h-[50px] min-w-[140px] sm:min-w-[200px] px-[20px] sm:px-[40px] transition duration-300 hover:bg-white hover:text-[#414141]">
              BOOK NOW
            </button>
          </Link>
        </div>
      </div>

      {/* Section 1 */}
      <div className="flex flex-row py-6 sm:py-10 min-h-[300px] sm:min-h-[420px]">
        {/* image */}
        <div className="w-1/2 relative overflow-hidden">
          <Image src={section1} alt="Manicure services" fill className="object-cover" />
        </div>
        {/* text */}
        <div className="w-1/2 flex justify-center items-center bg-[#f3ede8] text-center">
          <div className="max-w-[470px] px-2 sm:px-4">
            <p className="text-[#414141] text-[clamp(12px,2vw,22px)] mb-3 sm:mb-4 tracking-[.025em]">
              Explore our premium beauty services, including mani-pedis, eyelash and eyebrow
              treatments, nail art, and more
            </p>
            <Link href="/services">
              <button className="text-[#414141] bg-transparent border border-[#414141] text-[10px] sm:text-xs tracking-[.22em] h-[35px] sm:h-[45px] min-w-[120px] sm:min-w-[180px] px-[20px] sm:px-[35px] transition duration-300 hover:bg-[#414141] hover:text-white">
                PRICES
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Section 2 */}
      {/* <div className="flex flex-row py-6 sm:py-10 min-h-[300px] sm:min-h-[420px]">
        <div className="w-1/2 relative overflow-hidden">
          <Image src={section2} alt="Press-on nail kit" fill className="object-cover" />
        </div>
        <div className="w-1/2 flex justify-center items-center bg-[#fbf7f6] text-center">
          <div className="max-w-[470px] px-2 sm:px-4">
            <p className="text-[#414141] text-[clamp(12px,2vw,22px)] mb-3 sm:mb-4 tracking-[.025em]">
              Nail your look at home with our complete press-on nail kit—perfect for DIY nail art
            </p>
            <Link href="/shop">
              <button className="text-[#414141] bg-transparent border border-[#414141] text-[10px] sm:text-xs tracking-[.22em] h-[35px] sm:h-[45px] min-w-[120px] sm:min-w-[180px] px-[20px] sm:px-[35px] transition duration-300 hover:bg-[#414141] hover:text-white">
                SHOP NOW
              </button>
            </Link>
          </div>
        </div>
      </div> */}

      {/* Section 3 */}
      <div className="flex py-6 sm:py-10">
        <div className="flex flex-col justify-center items-center text-center max-w-[470px] mx-auto px-4">
          <div className="text-[10px] sm:text-xs tracking-[.22em] leading-[14px] mb-4 sm:mb-6">
            JOIN OUR JOURNEY
          </div>
          <p className="text-[clamp(13px,2vw,22px)] text-[#414141] tracking-[.025em] mb-3 sm:mb-4">
            Follow us on Instagram @nailaholics.mortdale to be the first to hear about our new
            design and get inspired
          </p>
          <a
            href="https://www.instagram.com/nailaholics.mortdale/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="text-[#414141] bg-transparent border border-[#414141] text-[10px] sm:text-xs tracking-[.22em] h-[35px] sm:h-[45px] min-w-[120px] sm:min-w-[180px] px-[20px] sm:px-[35px] transition duration-300 hover:bg-[#414141] hover:text-white">
              FOLLOW
            </button>
          </a>
        </div>
      </div>

      {/* Section 4 - Instagram grid */}
      <div className="py-6 sm:py-10 max-w-[1920px]">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {instagramPosts.map((post) => (
            <div key={post.id} className="relative aspect-square">
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                <div className="relative h-full group">
                  <Image
                    src={post.imageUrl}
                    alt={post.alt}
                    fill
                    className="object-cover transition-opacity duration-300 group-hover:opacity-50"
                  />
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5 */}
      <div className="flex py-6 sm:py-10">
        <div className="mx-auto text-center px-4">
          <div className="text-[clamp(13px,2.5vw,26px)] leading-[1.4] text-[#414141]">
            <span>Follow us at </span>
            <a
              href="https://www.instagram.com/nailaholics.mortdale/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9d9d9c] no-underline"
            >
              @nailaholics.mortdale
            </a>
          </div>
        </div>
      </div>

      {/* Section 6 - Blog posts */}
      <div className="flex flex-col py-6 sm:py-10 gap-6 sm:gap-10">
        {/* First blog post */}
        <div className="flex flex-row min-h-[300px] sm:min-h-[420px]">
          {/* text */}
          <div className="w-1/2 flex justify-center items-center bg-[#f3ede8] text-center">
            <div className="max-w-[470px] px-2 sm:px-4">
              {/* <div className="text-[10px] sm:text-xs tracking-[.22em] mb-4 sm:mb-6">
                December 8, 2024
              </div> */}
              <p className="text-[#414141] text-[clamp(14px,2.5vw,28px)] leading-[1.2] mb-3 sm:mb-4">
                Tips For Healthy Nails
              </p>
              <Link
                href="/aftercare"
                className="group text-[#414141] text-[10px] sm:text-xs tracking-[.22em] h-[35px] sm:h-[45px] leading-[35px] sm:leading-[45px] min-w-[120px] sm:min-w-[180px] transition-colors hover:text-gray-400 no-underline block text-center relative"
              >
                READ STORY
                <span className="absolute transform transition-transform duration-300 group-hover:translate-x-2 ml-1">
                  →
                </span>
              </Link>
            </div>
          </div>
          {/* image */}
          <div className="w-1/2 relative overflow-hidden">
            <Image src={blog1} alt="" fill className="object-cover" />
          </div>
        </div>

        {/* Second blog post */}
        {/* <div className="flex flex-row min-h-[300px] sm:min-h-[420px]">
          <div className="w-1/2 relative overflow-hidden">
            <Image src={blog2} alt="" fill className="object-cover" />
          </div>
          <div className="w-1/2 flex justify-center items-center bg-[#f3ede8] text-center">
            <div className="max-w-[470px] px-2 sm:px-4">
              <div className="text-[10px] sm:text-xs tracking-[.22em] mb-4 sm:mb-6">
                December 8, 2024
              </div>
              <p className="text-[#414141] text-[clamp(14px,2.5vw,28px)] leading-[1.2] mb-3 sm:mb-4">
                Popsicle Nails Are Trending For The Heatwave
              </p>
              <Link
                href=""
                className="group text-[#414141] text-[10px] sm:text-xs tracking-[.22em] h-[35px] sm:h-[45px] leading-[35px] sm:leading-[45px] min-w-[120px] sm:min-w-[180px] transition-colors hover:text-gray-400 no-underline block text-center relative"
              >
                READ STORY
                <span className="absolute transform transition-transform duration-300 group-hover:translate-x-2 ml-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div> */}
      </div>
    </>
  )
}
