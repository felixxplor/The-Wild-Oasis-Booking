import { Poppins } from 'next/font/google'
import '@/app/_styles/globals.css'
import Header from './_components/Header'
import { ReservationProvider } from './_components/ReservationContext'
import Footer from './_components/Footer'

// const poppins = Poppins({
//   weight: '300',
//   subsets: ['latin'],
//   display: 'swap',
// })

export const metadata = {
  title: {
    template: '%s | Nailaholics Nails & Beauty |',
    default: 'Nailaholics Nails & Beauty',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <meta name="color-scheme" content="dark" />
      <meta name="theme-color" content="#141c24" />
      <link rel="canonical" href="https://nailaholics.com.au" />
      <meta name="description" content="Nailaholics Nails & Beauty" />
      <meta name="application-name" content="Nailaholics Nails & Beauty" />
      <meta name="referrer" content="origin-when-cross-origin" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <meta name="apple-mobile-web-app-title" content="Nailaholics Nails & Beauty" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="author" content="Nailaholics Nails & Beauty" />
      <meta property="og:author" content="Nailaholics Nails & Beauty" />

      <meta
        name="keywords"
        content="Nailaholics Nails & Beauty,
            Nailaholics Nails and Beauty,
            Nailaholics Nails Mortdale,
            Nailaholics Nails and Waxing,
            Nailaholics Eyelashes"
      />
      <meta name="robots" content="index, follow" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://nailaholics.com.au" />
      <meta property="og:title" content="Nailaholics Nails & Beauty" />
      <meta property="og:description" content="Nailaholics Nails & Beauty" />
      <meta property="og:image" content="https://nailaholics.com.au/logo.png" />
      <meta property="og:image:secure_url" content="https://nailaholics.com.au/logo.png" />
      <meta property="og:site_name" content="Nailaholics Nails & Beauty" />
      <meta
        property="og:image:alt"
        content="Thumbnail image of Nailaholics Nails & Beauty website"
      />
      <meta property="og:updated_time" content="2024-09-13T10:23:00Z" />

      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1920" />
      <meta property="og:image:height" content="1080" />

      <meta property="og:locale" content="en_US" />
      <meta name="geo.region" content="BD-13" />
      <meta name="geo.placename" content="Sydney" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Nailaholics Nails & Beauty" />
      <meta name="twitter:description" content="Nailaholics Nails & Beauty" />
      <meta name="twitter:image" content="https://nailaholics.com.au/logo.png" />
      <meta name="twitter:url" content="" />
      <meta name="twitter:site" content="" />
      <meta name="twitter:creator" content="" />
      <meta name="twitter:image:alt" content="" />
      <body
        className={`font-sans antialiased bg-white text-[#414141] min-h-screen flex flex-col relative`}
      >
        <Header />

        <div className="flex-1 w-full">
          <main className="w-full px-4 sm:px-6 md:px-8 py-4">
            <ReservationProvider>{children}</ReservationProvider>
          </main>
        </div>

        <Footer />
      </body>
    </html>
  )
}
