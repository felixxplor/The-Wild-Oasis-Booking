import { Mail, Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react'

export const metadata = {
  title: 'Contact Us | NAILAHOLICS',
  description: 'Get in touch with NAILAHOLICS for appointments and inquiries',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-[clamp(28px,5vw,48px)] font-light leading-[1.2] text-[#414141] mb-6 tracking-[.025em]">
            CONTACT US
          </h1>
          <p className="text-[clamp(14px,2vw,18px)] text-[#414141] max-w-2xl mx-auto leading-relaxed tracking-[.01em]">
            Have questions or want to book an appointment? We are here to help. Reach out through
            any of the methods below.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        {/* Contact Information */}
        <div className="space-y-8 sm:space-y-10">
          <div className="text-center">
            <h2 className="text-[clamp(20px,4vw,32px)] font-light leading-[1.3] text-[#414141] mb-12 tracking-[.025em]">
              Get In Touch
            </h2>
          </div>

          {/* Contact Cards */}
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Phone */}
            <div className="border border-[#e5e5e5] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-[#414141] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm tracking-[.15em] text-[#414141] mb-3 font-light">PHONE</h3>
                  <p className="text-[#414141] mb-2">(02) 9579 1881</p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="border border-[#e5e5e5] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-[#414141] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm tracking-[.15em] text-[#414141] mb-3 font-light">EMAIL</h3>
                  <p className="text-[#414141] mb-2">nailaholics.official@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="border border-[#e5e5e5] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#414141] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm tracking-[.15em] text-[#414141] mb-3 font-light">
                    LOCATION
                  </h3>
                  <p className="text-[#414141]">4B Pitt St</p>
                  <p className="text-[#414141]">Mortdale NSW 2223</p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="border border-[#e5e5e5] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-[#414141] flex-shrink-0 mt-1" />
                <div className="w-full">
                  <h3 className="text-sm tracking-[.15em] text-[#414141] mb-4 font-light">
                    BUSINESS HOURS
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#666]">Monday - Wednesday</span>
                      <span className="text-[#414141]">9:00 AM - 5:30 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666]">Thursday</span>
                      <span className="text-[#414141]">9:00 AM - 7:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666]">Friday</span>
                      <span className="text-[#414141]">9:00 AM - 5:30 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666]">Saturday</span>
                      <span className="text-[#414141]">9:00 AM - 5:30 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666]">Sunday</span>
                      <span className="text-[#414141]">10:00 AM - 5:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="border border-[#e5e5e5] p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex gap-2 mt-1">
                  <Instagram className="w-5 h-5 text-[#414141] flex-shrink-0" />
                  <Facebook className="w-5 h-5 text-[#414141] flex-shrink-0" />
                </div>
                <div className="w-full">
                  <h3 className="text-sm tracking-[.15em] text-[#414141] mb-4 font-light">
                    FOLLOW US
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <a
                        href="https://www.instagram.com/nailaholics.mortdale"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#414141] hover:text-[#666] transition-colors flex items-center gap-2"
                      >
                        <Instagram className="w-4 h-4" />
                        <span>@nailaholics.mortdale</span>
                      </a>
                    </div>
                    <div>
                      <a
                        href="https://www.facebook.com/p/Nailaholics-Nails-Beauty-61571777837251/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#414141] hover:text-[#666] transition-colors flex items-center gap-2"
                      >
                        <Facebook className="w-4 h-4" />
                        <span>Nailaholics Nails & Beauty</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-[clamp(20px,4vw,32px)] font-light leading-[1.3] text-[#414141] mb-6 tracking-[.025em]">
            Visit Us Today
          </h2>
          <p className="text-[#414141] text-sm sm:text-base mb-8 max-w-2xl mx-auto leading-relaxed tracking-[.01em]">
            Experience our premium nail and beauty services in our relaxing, professional
            environment. We look forward to welcoming you.
          </p>
        </div>
      </div>
    </div>
  )
}
