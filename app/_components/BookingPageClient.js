'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Check,
  Plus,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import Link from 'next/link'
import DateSelector from './DateSelector'
import { useReservation } from './ReservationContext'
import { useRouter } from 'next/navigation'

function BookingPage({ services = [], settings, bookedDates, staffData = [], session = null }) {
  const router = useRouter()
  const { reservation, setReservation } = useReservation()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [activeTab, setActiveTab] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [availableStaff, setAvailableStaff] = useState([])
  const [showScrollUpIndicator, setShowScrollUpIndicator] = useState(false)
  const [showScrollDownIndicator, setShowScrollDownIndicator] = useState(false)
  const [servicesAboveCount, setServicesAboveCount] = useState(0)
  const [servicesBelowCount, setServicesBelowCount] = useState(0)
  const categoryRefs = useRef({})
  const contentRef = useRef(null)

  const steps = [
    { id: 1, name: 'Services', key: 'services' },
    { id: 2, name: 'Professional', key: 'professional' },
    { id: 3, name: 'Time', key: 'time' },
  ]

  // Organize services by category
  const organizedServices = services.reduce((acc, service) => {
    const category = service.category || 'other'
    if (!acc[category]) acc[category] = []
    acc[category].push(service)
    return acc
  }, {})

  const categories = Object.keys(organizedServices)

  // Set initial active tab
  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0])
    }
  }, [categories, activeTab])

  // Restore state from sessionStorage
  useEffect(() => {
    const savedState = sessionStorage.getItem('bookingState')
    if (savedState) {
      try {
        const bookingState = JSON.parse(savedState)
        if (bookingState.selectedServices?.length > 0) {
          setSelectedServices(bookingState.selectedServices)
        }
        setTimeout(() => {
          if (bookingState.selectedArtist) {
            setSelectedArtist(bookingState.selectedArtist)
          }
          if (bookingState.date && bookingState.time) {
            setReservation({
              date: new Date(bookingState.date),
              time: bookingState.time,
            })
          }
        }, 300)
        sessionStorage.removeItem('bookingState')
      } catch (error) {
        console.error('Error restoring booking state:', error)
        sessionStorage.removeItem('bookingState')
      }
    }
  }, [setReservation])

  // Scroll spy to detect which category is in view and check for selected services above/below
  useEffect(() => {
    if (currentStep !== 1) return

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 300 // Offset for sticky header
      const viewportBottom = window.scrollY + window.innerHeight

      // Check if any selected service is above or below viewport
      let countAbove = 0
      let countBelow = 0

      selectedServices.forEach((serviceId) => {
        const service = services.find((s) => s.id === serviceId)
        if (!service) return
        const category = service.category || 'other'
        const categoryEl = categoryRefs.current[category]
        if (!categoryEl) return
        const rect = categoryEl.getBoundingClientRect()
        const elementTop = rect.top + window.scrollY
        const elementBottom = rect.bottom + window.scrollY

        // Check if above viewport (accounting for sticky header)
        if (elementBottom < window.scrollY + 200) {
          countAbove++
        }
        // Check if below viewport
        if (elementTop > viewportBottom - 100) {
          countBelow++
        }
      })

      setShowScrollUpIndicator(countAbove > 0)
      setShowScrollDownIndicator(countBelow > 0)
      setServicesAboveCount(countAbove)
      setServicesBelowCount(countBelow)

      // Update active tab based on scroll position
      for (const category of categories) {
        const element = categoryRefs.current[category]
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 300 && rect.bottom > 300) {
            setActiveTab(category)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentStep, categories, selectedServices, services])

  // Filter available staff
  useEffect(() => {
    if (selectedServices.length === 0) {
      setAvailableStaff([])
      setSelectedArtist(null)
      return
    }

    const selectedServiceObjects = services.filter((service) =>
      selectedServices.includes(service.id)
    )

    const filteredStaff = staffData.filter((staff) => {
      const staffServiceIds = staff.staff_services?.map((ss) => ss.serviceId)
      return selectedServiceObjects.every((service) => staffServiceIds.includes(service.id))
    })

    setAvailableStaff(filteredStaff)

    if (selectedArtist && selectedArtist !== 'any') {
      const isSelectedArtistAvailable = filteredStaff.some(
        (staff) => staff.name === selectedArtist || staff.id.toString() === selectedArtist
      )
      if (!isSelectedArtistAvailable) {
        setSelectedArtist(null)
      }
    }
  }, [selectedServices, services, staffData, selectedArtist])

  // Filter services based on search
  const getFilteredServices = () => {
    if (!searchTerm) return organizedServices

    const filtered = {}
    Object.entries(organizedServices).forEach(([category, services]) => {
      const matchingServices = services.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (matchingServices.length > 0) {
        filtered[category] = matchingServices
      }
    })
    return filtered
  }

  const filteredServicesByCategory = getFilteredServices()

  const toggleServiceSelection = (serviceId) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId)
      } else {
        return [...prev, serviceId]
      }
    })
  }

  const handleArtistSelection = (artistValue) => {
    setSelectedArtist(artistValue)
  }

  const getSelectedServiceObjects = () => {
    return services.filter((service) => selectedServices.includes(service.id))
  }

  const calculateTotals = () => {
    const selectedServiceObjects = getSelectedServiceObjects()
    let totalPriceNum = 0
    let hasPlus = false

    selectedServiceObjects.forEach((service) => {
      const priceStr = String(
        service.discount ? service.regularPrice - service.discount : service.regularPrice
      )
      if (priceStr.includes('+')) hasPlus = true
      const numericPrice = parseFloat(priceStr.replace('+', ''))
      totalPriceNum += numericPrice
    })

    const totalPrice = hasPlus ? `${totalPriceNum}+` : totalPriceNum
    const totalDuration = selectedServiceObjects.reduce((sum, service) => sum + service.duration, 0)
    return { totalPrice, totalDuration }
  }

  const { totalPrice, totalDuration } = calculateTotals()

  const formatTabName = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')
  }

  const scrollToCategory = (category) => {
    const element = categoryRefs.current[category]
    if (element) {
      const yOffset = -200 // Offset for sticky header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  const scrollToClosestSelectedAbove = () => {
    if (selectedServices.length === 0) return

    const currentScrollY = window.scrollY
    let closestService = null
    let closestDistance = Infinity

    selectedServices.forEach((serviceId) => {
      const service = services.find((s) => s.id === serviceId)
      if (!service) return

      const category = service.category || 'other'
      const categoryEl = categoryRefs.current[category]
      if (!categoryEl) return

      const rect = categoryEl.getBoundingClientRect()
      const elementTopY = rect.top + window.scrollY

      // Only consider services that are above the current viewport
      if (elementTopY < currentScrollY - 100) {
        const distance = currentScrollY - elementTopY
        if (distance < closestDistance) {
          closestDistance = distance
          closestService = category
        }
      }
    })

    if (closestService) {
      scrollToCategory(closestService)
    } else {
      const firstSelectedService = services.find((s) => selectedServices.includes(s.id))
      if (firstSelectedService) {
        const category = firstSelectedService.category || 'other'
        scrollToCategory(category)
      }
    }
  }

  const scrollToClosestSelectedBelow = () => {
    if (selectedServices.length === 0) return

    const viewportBottom = window.scrollY + window.innerHeight
    let closestService = null
    let closestDistance = Infinity

    selectedServices.forEach((serviceId) => {
      const service = services.find((s) => s.id === serviceId)
      if (!service) return

      const category = service.category || 'other'
      const categoryEl = categoryRefs.current[category]
      if (!categoryEl) return

      const rect = categoryEl.getBoundingClientRect()
      const elementTopY = rect.top + window.scrollY

      // Only consider services that are below the current viewport
      if (elementTopY > viewportBottom + 100) {
        const distance = elementTopY - viewportBottom
        if (distance < closestDistance) {
          closestDistance = distance
          closestService = category
        }
      }
    })

    if (closestService) {
      scrollToCategory(closestService)
    } else {
      const lastSelectedService = services.filter((s) => selectedServices.includes(s.id)).pop()
      if (lastSelectedService) {
        const category = lastSelectedService.category || 'other'
        scrollToCategory(category)
      }
    }
  }

  const getStaffInitials = (name) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isStaffBusy = (staff) => {
    return staff.bookings && staff.bookings.length > 20
  }

  const getSelectedStaffData = () => {
    if (selectedArtist === 'any') {
      const allShifts = availableStaff.flatMap((staff) => staff.staff_shifts || [])
      const allBookings = availableStaff.flatMap((staff) => staff.bookings || [])
      return {
        staff_shifts: allShifts,
        bookings: allBookings,
        isAnyArtist: true,
        availableStaff: availableStaff,
      }
    } else {
      const staff = availableStaff.find(
        (s) => s.name === selectedArtist || s.id.toString() === selectedArtist
      )
      return staff
        ? {
            staff_shifts: staff.staff_shifts || [],
            bookings: staff.bookings || [],
            isAnyArtist: false,
            selectedStaff: staff,
          }
        : { staff_shifts: [], bookings: [], isAnyArtist: false }
    }
  }

  const canProceed = () => {
    if (currentStep === 1) return selectedServices.length > 0
    if (currentStep === 2) return selectedArtist !== null
    if (currentStep === 3) return reservation?.date && reservation?.time
    return true
  }

  const handleNext = () => {
    if (canProceed() && currentStep < 3) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleConfirmBooking = () => {
    if (session?.user) {
      const params = new URLSearchParams({
        services: selectedServices.join(','),
        artist: selectedArtist,
        date: reservation?.date?.toISOString(),
        time: reservation?.time,
      })
      router.push(`/booking-summary?${params.toString()}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-16 sm:mt-20 pb-32 lg:pb-0">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 bg-white min-h-screen">
            {/* Header with Back */}
            <div className="bg-white border-b">
              <div className="flex items-center justify-between p-4 sm:p-6">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 transition-colors ${
                    currentStep === 1 ? 'invisible' : ''
                  }`}
                >
                  <ArrowLeft size={20} className="text-gray-700" />
                </button>
                <div className="w-10 sm:w-12"></div>
              </div>

              {/* Breadcrumb */}
              <div className="px-4 sm:px-8 pb-3 sm:pb-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                      <button
                        onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                        className={`${
                          step.id === currentStep
                            ? 'font-bold text-gray-900'
                            : step.id < currentStep
                            ? 'text-gray-500 hover:text-gray-900'
                            : 'text-gray-400'
                        }`}
                        disabled={step.id > currentStep}
                      >
                        {step.name}
                      </button>
                      {index < steps.length - 1 && (
                        <ChevronRight className="text-gray-400" size={16} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="px-4 sm:px-8 pb-4 sm:pb-8">
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
                  {steps[currentStep - 1].name}
                </h1>
              </div>
            </div>

            {/* Sticky Category Tabs - Only on Services step */}
            {currentStep === 1 && (
              <div className="sticky top-16 sm:top-[62px] bg-white z-10 border-b">
                {/* Search Bar */}
                <div className="px-4 sm:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search for a Service"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                    />
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="px-4 sm:px-8 pb-3 sm:pb-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        document
                          .getElementById('tabs-container')
                          .scrollBy({ left: -150, behavior: 'smooth' })
                      }}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 flex-shrink-0"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div
                      id="tabs-container"
                      className="flex gap-2 overflow-x-auto scrollbar-hide flex-1"
                    >
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => scrollToCategory(category)}
                          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                            activeTab === category
                              ? 'bg-black text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {formatTabName(category)}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        document
                          .getElementById('tabs-container')
                          .scrollBy({ left: 150, behavior: 'smooth' })
                      }}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 flex-shrink-0"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Selected Services Indicators */}
                {selectedServices.length > 0 && (
                  <div className="px-4 sm:px-8 pb-3 sm:pb-4 flex items-center justify-center gap-2 sm:gap-3">
                    {showScrollUpIndicator && (
                      <button
                        onClick={scrollToClosestSelectedAbove}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                      >
                        <span>
                          {servicesAboveCount} selected service{servicesAboveCount > 1 ? 's' : ''}
                        </span>
                        <ChevronUp size={14} className="stroke-[2.5] flex-shrink-0" />
                      </button>
                    )}
                    {showScrollDownIndicator && (
                      <button
                        onClick={scrollToClosestSelectedBelow}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                      >
                        <span>
                          {servicesBelowCount} selected service{servicesBelowCount > 1 ? 's' : ''}
                        </span>
                        <ChevronDown size={14} className="stroke-[2.5] flex-shrink-0" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Content Area */}
            <div ref={contentRef} className="px-4 sm:px-8 py-4 sm:py-8">
              {/* Step 1: Services */}
              {currentStep === 1 && (
                <div>
                  {Object.entries(filteredServicesByCategory).length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        No services found matching &#34;{searchTerm}&#34;
                      </p>
                    </div>
                  ) : (
                    Object.entries(filteredServicesByCategory).map(([category, services]) => (
                      <div
                        key={category}
                        ref={(el) => (categoryRefs.current[category] = el)}
                        className="mb-12 last:mb-0"
                      >
                        <h2 className="text-2xl font-bold mb-6">{formatTabName(category)}</h2>
                        <div className="space-y-4">
                          {services.map((service) => {
                            const isSelected = selectedServices.includes(service.id)

                            return (
                              <div
                                key={service.id}
                                className={`bg-white rounded-xl p-6 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-2 border-blue-600 bg-blue-50'
                                    : 'border border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => toggleServiceSelection(service.id)}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 text-base mb-2">
                                      {service.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                      {service.duration} mins
                                    </p>
                                    {service.description && (
                                      <p className="text-sm text-gray-500 mb-3">
                                        {service.description}
                                      </p>
                                    )}
                                    <p className="text-base font-semibold text-gray-900">
                                      ${service.regularPrice}
                                    </p>
                                  </div>
                                  <button
                                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                      isSelected
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                  >
                                    {isSelected ? <Check size={20} /> : <Plus size={20} />}
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Step 2: Professional */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div
                    className={`border rounded-xl p-6 cursor-pointer transition-colors ${
                      selectedArtist === 'any'
                        ? 'border-2 border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleArtistSelection('any')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-2xl">👤</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Any Professional</h4>
                          <p className="text-sm text-gray-600">{availableStaff.length} available</p>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedArtist === 'any'
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedArtist === 'any' && <Check size={14} className="text-white" />}
                      </div>
                    </div>
                  </div>

                  {availableStaff.map((staff) => {
                    const busy = isStaffBusy(staff)
                    const isSelected = selectedArtist === staff.name
                    return (
                      <div
                        key={staff.id}
                        className={`border rounded-xl p-6 cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-2 border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${busy ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !busy && handleArtistSelection(staff.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                              {staff.avatar ? (
                                <img
                                  src={staff.avatar}
                                  alt={staff.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-white">
                                  {getStaffInitials(staff.name)}
                                </span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{staff.name}</h4>
                              {staff.bio && <p className="text-sm text-gray-600">{staff.bio}</p>}
                            </div>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <Check size={14} className="text-white" />}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Step 3: Time */}
              {currentStep === 3 && (
                <div>
                  <DateSelector
                    staffShifts={getSelectedStaffData().staff_shifts}
                    bookedSlots={getSelectedStaffData().bookings}
                    serviceDuration={totalDuration}
                    isAnyArtist={getSelectedStaffData().isAnyArtist}
                    availableStaff={getSelectedStaffData().availableStaff}
                    selectedStaff={getSelectedStaffData().selectedStaff}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Booking Summary - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-4 bg-white border-l">
            <div className="sticky top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] flex flex-col">
              {/* Salon Info */}
              <div className="p-8 border-b">
                <div className="flex items-start gap-4">
                  <img
                    src="/logo.png"
                    alt="Salon"
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base mb-1">
                      Nailaholics Nails & Beauty
                    </h3>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-semibold">4.9</span>
                      <span className="text-yellow-400">★★★★★</span>
                      <span className="text-sm text-gray-500">(881)</span>
                    </div>
                    <p className="text-sm text-gray-600">Shop 3/12 Park Street, Peakhurst, NSW</p>
                  </div>
                </div>
              </div>

              {/* Selected Services */}
              <div className="flex-1 overflow-y-auto p-8">
                {selectedServices.length > 0 ? (
                  <div className="space-y-6">
                    {getSelectedServiceObjects().map((service) => (
                      <div key={service.id} className="pb-6 border-b border-gray-100 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 text-base pr-4">
                            {service.name}
                          </h4>
                          <span className="font-semibold text-gray-900">
                            ${service.regularPrice}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {service.duration} mins with any professional
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No services selected</p>
                )}
              </div>

              {/* Total & Continue/Confirm */}
              <div className="border-t p-8 bg-white">
                {selectedServices.length > 0 && (
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-semibold text-gray-900 text-lg">Total</span>
                    <span className="font-bold text-gray-900 text-2xl">${totalPrice}</span>
                  </div>
                )}

                {/* Show Continue button for steps 1-2, Confirm Booking for step 3 with date/time */}
                {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className={`w-full py-4 rounded-full text-base font-semibold transition-colors ${
                      canProceed()
                        ? 'bg-black text-white hover:bg-gray-800'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Continue
                  </button>
                ) : currentStep === 3 && reservation?.date && reservation?.time ? (
                  session?.user ? (
                    <button
                      onClick={handleConfirmBooking}
                      className="w-full py-4 rounded-full text-base font-semibold bg-black text-white hover:bg-gray-800 transition-colors"
                    >
                      Review Your Booking
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        href={`/login?redirect=/booking-summary&services=${selectedServices.join(
                          ','
                        )}&artist=${selectedArtist}&date=${reservation?.date?.toISOString()}&time=${
                          reservation?.time
                        }`}
                        className="w-full py-4 rounded-full text-base font-semibold bg-black text-white hover:bg-gray-800 transition-colors block text-center"
                      >
                        Sign In to Book
                      </Link>
                      <p className="text-center text-xs text-gray-600">
                        Do not have an account?{' '}
                        <Link
                          href="/signup"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Create one here
                        </Link>
                      </p>
                    </div>
                  )
                ) : null}

                {currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    className="w-full mt-3 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors text-sm"
                  >
                    Back
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Summary Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="p-4">
          {selectedServices.length > 0 ? (
            <div className="space-y-3">
              {/* Collapsible Summary */}
              <button
                onClick={() => {
                  const details = document.getElementById('mobile-summary-details')
                  const arrow = document.getElementById('mobile-summary-arrow')
                  if (details.classList.contains('hidden')) {
                    details.classList.remove('hidden')
                    arrow.style.transform = 'rotate(180deg)'
                  } else {
                    details.classList.add('hidden')
                    arrow.style.transform = 'rotate(0deg)'
                  }
                }}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-blue-600 text-white text-sm font-bold rounded-full">
                    {selectedServices.length}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    selected service{selectedServices.length > 1 ? 's' : ''}
                  </span>
                  <ChevronUp
                    id="mobile-summary-arrow"
                    size={18}
                    className="text-blue-600 transition-transform stroke-[2.5]"
                  />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-gray-900">${totalPrice}</span>
                  <span className="text-xs text-gray-600">• {totalDuration} mins</span>
                </div>
              </button>

              {/* Expandable Service List */}
              <div
                id="mobile-summary-details"
                className="hidden max-h-48 overflow-y-auto space-y-2"
              >
                {getSelectedServiceObjects().map((service) => (
                  <div
                    key={service.id}
                    className="flex justify-between items-start text-sm py-2 border-t"
                  >
                    <div className="flex-1 pr-2">
                      <p className="font-medium text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-600">{service.duration} mins</p>
                    </div>
                    <span className="font-semibold text-gray-900">${service.regularPrice}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`w-full py-3.5 rounded-full text-base font-semibold transition-colors ${
                    canProceed()
                      ? 'bg-black text-white active:bg-gray-800'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              ) : currentStep === 3 && reservation?.date && reservation?.time ? (
                session?.user ? (
                  <button
                    onClick={handleConfirmBooking}
                    className="w-full py-3.5 rounded-full text-base font-semibold bg-black text-white active:bg-gray-800 transition-colors"
                  >
                    Review Your Booking
                  </button>
                ) : (
                  <Link
                    href={`/login?redirect=/booking-summary&services=${selectedServices.join(
                      ','
                    )}&artist=${selectedArtist}&date=${reservation?.date?.toISOString()}&time=${
                      reservation?.time
                    }`}
                    className="w-full py-3.5 rounded-full text-base font-semibold bg-black text-white active:bg-gray-800 transition-colors block text-center"
                  >
                    Sign In to Book
                  </Link>
                )
              ) : null}
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-gray-500">Select services to continue</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default BookingPage
