import { Heart, Droplet, Shield, AlertCircle, Clock, Sparkles, Phone } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Aftercare Guide | NAILAHOLICS',
  description: 'Learn how to care for your nails and keep them beautiful longer',
}

export default function AftercarePage() {
  const aftercareSteps = [
    {
      number: '1',
      title: 'Be Gentle',
      description: 'Avoid using your nails as tools. Be mindful when opening cans, boxes, or doing heavy tasks.',
      icon: Heart,
    },
    {
      number: '2',
      title: 'Moisturize Daily',
      description: 'Apply cuticle oil and hand cream regularly to keep your nails and skin hydrated.',
      icon: Droplet,
    },
    {
      number: '3',
      title: 'Avoid Prolonged Water Exposure',
      description: 'Wear gloves when washing dishes or cleaning to protect your nails from lifting or damage.',
      icon: Shield,
    },
    {
      number: '4',
      title: 'No Picking or Peeling',
      description: 'Do not peel off gel, acrylic, or dipping powder. This can damage your natural nails.',
      icon: AlertCircle,
    },
    {
      number: '5',
      title: 'Protect from Chemicals',
      description: 'Avoid harsh chemicals like cleaning products or acetone without protection. Always wear gloves.',
      icon: Shield,
    },
    {
      number: '6',
      title: 'Schedule Regular Fills or Removal',
      description: 'Come back for infills every 2–3 weeks. Never try to remove your nails yourself.',
      icon: Clock,
    },
    {
      number: '7',
      title: 'Report Issues Promptly',
      description: 'If you experience lifting, chipping, or any problems, please contact us within 3 days for a free fix (same design only).',
      icon: Phone,
    },
    {
      number: '8',
      title: 'Keep Nails Dry and Clean',
      description: 'This helps prevent bacteria or fungal growth, especially under enhancements.',
      icon: Sparkles,
    },
    {
      number: '9',
      title: 'Avoid Excessive Heat',
      description: 'After a fresh gel or acrylic set, avoid saunas or hot showers for 24 hours.',
      icon: AlertCircle,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-[clamp(28px,5vw,48px)] font-light leading-[1.2] text-[#414141] mb-6 tracking-[.025em]">
            AFTERCARE GUIDE
          </h1>
          <p className="text-[clamp(14px,2vw,18px)] text-[#414141] max-w-2xl mx-auto leading-relaxed tracking-[.01em] mb-4">
            Keep your nails looking beautiful and lasting longer by following a few simple steps
          </p>
          <p className="text-[clamp(14px,2vw,18px)] text-[#414141] max-w-2xl mx-auto leading-relaxed tracking-[.01em]">
            Your hands work hard — show them some love!
          </p>
        </div>
      </div>

      {/* Aftercare Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="space-y-6">
          {aftercareSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={index}
                className="border border-[#e5e5e5] p-6 sm:p-8 transition-all duration-200 hover:border-[#414141]"
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 border-2 border-[#414141] rounded-full flex items-center justify-center">
                      <span className="text-lg font-light text-[#414141]">{step.number}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-light text-[#414141] mb-3 tracking-[.025em]">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-[#666] leading-relaxed tracking-[.01em]">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 hidden sm:block">
                    <Icon className="w-6 h-6 text-[#414141]" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Promotion Notice */}
        <div className="mt-12 border-2 border-[#414141] p-6 sm:p-8 bg-[#f9f9f9]">
          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-[#414141] flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-base sm:text-lg font-light text-[#414141] mb-3 tracking-[.025em]">
                PROMOTION
              </h3>
              <p className="text-sm sm:text-base text-[#666] leading-relaxed tracking-[.01em]">
                Please note that all discounts are applicable to cash payments only
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-[clamp(20px,4vw,32px)] font-light leading-[1.3] text-[#414141] mb-4 tracking-[.025em]">
            Got Questions?
          </h2>
          <p className="text-[#414141] text-sm sm:text-base mb-8 max-w-2xl mx-auto leading-relaxed tracking-[.01em]">
            Our team is happy to help anytime! 💖
          </p>
          <Link href="/contact">
            <button className="text-[#414141] bg-transparent border border-[#414141] text-[10px] sm:text-xs tracking-[.22em] h-[45px] sm:h-[50px] min-w-[160px] sm:min-w-[200px] px-8 sm:px-10 transition duration-300 hover:bg-[#414141] hover:text-white">
              CONTACT US
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}