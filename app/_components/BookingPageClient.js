'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, X, ChevronDown, ChevronUp, Instagram, Facebook } from 'lucide-react'
import Link from 'next/link'
import DateSelector from './DateSelector'
import { useReservation } from './ReservationContext'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

function BookingPage({ services = [], settings, bookedDates, staffData = [], session = null }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { reservation, setReservation } = useReservation()
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [availableStaff, setAvailableStaff] = useState([])
  const [expandedCategories, setExpandedCategories] = useState({})
  const dateSelectionRef = useRef(null)

  // REPLACE your existing URL params useEffect with this combined version:

  useEffect(() => {
    // Priority 1: Check sessionStorage first (from back navigation)
    const savedState = sessionStorage.getItem('bookingState')

    if (savedState) {
      try {
        const bookingState = JSON.parse(savedState)

        // Restore selected services
        if (bookingState.selectedServices?.length > 0) {
          setSelectedServices(bookingState.selectedServices)
        }

        // Restore selected artist and date/time
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

        // Clear sessionStorage after restoring
        sessionStorage.removeItem('bookingState')
        return // Exit early, don't process URL params
      } catch (error) {
        console.error('Error restoring booking state:', error)
        sessionStorage.removeItem('bookingState')
      }
    }
  }, [setReservation])

  // Auto-scroll to date selection when artist is selected
  useEffect(() => {
    if (selectedArtist && dateSelectionRef.current) {
      setTimeout(() => {
        dateSelectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 100)
    }
  }, [selectedArtist])

  // Filter available staff based on selected services
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
      const canProvideAll = selectedServiceObjects.every((service) => {
        const canProvide = staffServiceIds.includes(service.id)
        return canProvide
      })
      return canProvideAll
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
  }, [selectedServices, services, staffData])

  // Organize services by category and create tab structure
  const organizedServices = services.reduce((acc, service) => {
    const category = service.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(service)
    return acc
  }, {})

  // Create tab options - include 'all' option plus unique categories
  const tabOptions = ['all', ...Object.keys(organizedServices)]

  // Filter services based on active tab and search term
  const getFilteredServices = () => {
    let filtered = services

    if (activeTab !== 'all') {
      filtered = filtered.filter((service) => service.category === activeTab)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort by price high to low
    filtered = [...filtered].sort((a, b) => {
      const priceA = parseFloat(String(a.discount || a.regularPrice).replace('+', ''))
      const priceB = parseFloat(String(b.discount || b.regularPrice).replace('+', ''))
      return priceB - priceA
    })

    return filtered
  }

  const filteredServices = getFilteredServices()

  // Group filtered services by category for accordion view
  const groupedFilteredServices = filteredServices.reduce((acc, service) => {
    const category = service.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(service)
    return acc
  }, {})

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  // Handle service selection/deselection
  const toggleServiceSelection = (serviceId) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId)
      } else {
        return [...prev, serviceId]
      }
    })
  }

  // Remove specific service from selection
  const removeService = (serviceId) => {
    setSelectedServices((prev) => prev.filter((id) => id !== serviceId))
  }

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedServices([])
    setSelectedArtist(null)
  }

  // Handle artist selection
  const handleArtistSelection = (artistValue) => {
    setSelectedArtist(artistValue)
  }

  // Get selected service objects for display
  const getSelectedServiceObjects = () => {
    return services.filter((service) => selectedServices.includes(service.id))
  }

  // Calculate total price and duration - UPDATED TO HANDLE "+" SUFFIX
  const calculateTotals = () => {
    const selectedServiceObjects = getSelectedServiceObjects()
    let totalPriceNum = 0
    let hasPlus = false

    selectedServiceObjects.forEach((service) => {
      const priceStr = String(
        service.discount ? service.regularPrice - service.discount : service.regularPrice
      )

      // Check if price has "+" suffix
      if (priceStr.includes('+')) {
        hasPlus = true
      }

      // Extract numeric value
      const numericPrice = parseFloat(priceStr.replace('+', ''))
      totalPriceNum += numericPrice
    })

    const totalPrice = hasPlus ? `${totalPriceNum}+` : totalPriceNum
    const totalDuration = selectedServiceObjects.reduce((sum, service) => sum + service.duration, 0)

    return { totalPrice, totalDuration }
  }

  const { totalPrice, totalDuration } = calculateTotals()

  // Format price display - UPDATED TO HANDLE "+" SUFFIX
  const formatPrice = (service) => {
    if (service.discount) {
      const regularPriceStr = String(service.regularPrice)
      const discountStr = String(service.discount)

      const hasPlus = regularPriceStr.includes('+')
      const regularPriceNum = parseFloat(regularPriceStr.replace('+', ''))
      const discountNum = parseFloat(discountStr.replace('+', ''))

      const discountedPrice = regularPriceNum - discountNum
      const discountedPriceStr = hasPlus ? `${discountedPrice}+` : discountedPrice

      return (
        <div className="flex items-center gap-1.5">
          <span className="line-through text-gray-500 text-xs sm:text-sm">${regularPriceStr}</span>
          <span className="font-semibold text-green-600 text-sm sm:text-base">
            ${discountedPriceStr}
          </span>
        </div>
      )
    }
    return <span className="font-semibold text-sm sm:text-base">${service.regularPrice}</span>
  }

  // Capitalize category names for display
  const formatTabName = (category) => {
    if (category === 'all') return 'ALL SERVICES'
    return category.toUpperCase().replace('_', ' ')
  }

  // Get staff initials for avatar
  const getStaffInitials = (name) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Simplified staff busy check
  const isStaffBusy = (staff) => {
    return staff.bookings && staff.bookings.length > 20
  }

  // Get the selected staff member's data for DateSelector
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

  // Render service item in compact mode
  const renderServiceItem = (service) => {
    const isSelected = selectedServices.includes(service.id)

    return (
      <div
        key={service.id}
        className={`border rounded-lg p-2.5 sm:p-3 cursor-pointer transition-all duration-200 ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
        onClick={() => toggleServiceSelection(service.id)}
      >
        <div className="flex justify-between items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleServiceSelection(service.id)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 rounded pointer-events-none flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-800 text-xs sm:text-sm truncate">
                {service.name}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <span className="text-xs text-gray-500 whitespace-nowrap">{service.duration}min</span>
            <div className="text-sm">{formatPrice(service)}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-16 sm:mt-20">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
            {/* Location Section */}
            <div className="px-4 sm:px-6 py-4 sm:py-6 border-b">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 text-sm sm:text-base">
                  Nailaholics Nails & Beauty
                </span>
              </div>
            </div>

            {/* Booking For Section */}
            <div className="p-4 sm:p-6 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <span className="text-gray-700 text-sm sm:text-base">
                  I would like to book an appointment for
                </span>
                <select className="border border-gray-300 rounded px-3 py-1.5 sm:py-1 text-sm bg-white w-full sm:w-auto">
                  <option>just me</option>
                  <option>2 people</option>
                  <option>3 people</option>
                  <option>4+ people</option>
                </select>
              </div>
            </div>

            {/* Selected Services Summary */}
            {selectedServices.length > 0 && (
              <div className="p-4 sm:p-6 border-b bg-blue-50">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                    Selected Services ({selectedServices.length})
                  </h3>
                  <button
                    onClick={clearAllSelections}
                    className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 mb-3 sm:mb-4">
                  {getSelectedServiceObjects().map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between bg-white p-2.5 sm:p-3 rounded border"
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <span className="font-medium text-xs sm:text-sm block truncate">
                          {service.name}
                        </span>
                        <span className="text-gray-500 text-xs">({service.duration} mins)</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <div className="text-xs sm:text-sm">{formatPrice(service)}</div>
                        <button
                          onClick={() => removeService(service.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-3 border-t text-sm sm:text-base">
                  <span className="font-semibold">Total: ${totalPrice}</span>
                  <span className="text-gray-600">Duration: {totalDuration} mins</span>
                </div>
              </div>
            )}

            {/* Service Selection */}
            <div className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                SELECT SERVICES
                {selectedServices.length > 0 && (
                  <span className="block sm:inline text-xs sm:text-sm font-normal text-gray-600 sm:ml-2 mt-1 sm:mt-0">
                    (You can select multiple services)
                  </span>
                )}
              </h2>

              {/* Search Bar */}
              <div className="relative mb-4 sm:mb-6">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search for a Service"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm sm:text-base"
                />
              </div>

              {/* Service Tabs */}
              <div className="flex flex-wrap gap-1 sm:gap-1 mb-4 sm:mb-6">
                {tabOptions.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded transition-colors ${
                      activeTab === tab
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {formatTabName(tab)}
                  </button>
                ))}
              </div>

              {/* Service List - Accordion Style by Category */}
              <div className="space-y-2 sm:space-y-3">
                {filteredServices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    {searchTerm
                      ? 'No services found matching your search.'
                      : 'No services available.'}
                  </div>
                ) : activeTab === 'all' && !searchTerm ? (
                  // Show accordion view when "all" tab is active and no search
                  Object.entries(groupedFilteredServices).map(([category, categoryServices]) => (
                    <div key={category} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                            {formatTabName(category)}
                          </h3>
                          <span className="text-xs sm:text-sm text-gray-500">
                            ({categoryServices.length} service
                            {categoryServices.length !== 1 ? 's' : ''})
                          </span>
                        </div>
                        {expandedCategories[category] ? (
                          <ChevronUp className="text-gray-600" size={18} />
                        ) : (
                          <ChevronDown className="text-gray-600" size={18} />
                        )}
                      </button>
                      {expandedCategories[category] && (
                        <div className="p-3 sm:p-4 space-y-2 bg-white">
                          {categoryServices.map((service) => renderServiceItem(service))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // Show flat list when category is selected or search is active
                  <div className="space-y-2">
                    {filteredServices.map((service) => renderServiceItem(service))}
                  </div>
                )}
              </div>

              {/* Artist Selection Section */}
              {selectedServices.length > 0 && (
                <div className="mt-6 sm:mt-8 pt-6 border-t">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                    SELECT AN ARTIST
                  </h2>

                  {availableStaff.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No artists available for the selected services.
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {/* Any Artist Option */}
                      <div
                        className="border rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                        onClick={() => handleArtistSelection('any')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800 text-sm sm:text-base">
                                Any Artist
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {availableStaff.length} available
                              </p>
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="artist"
                            value="any"
                            checked={selectedArtist === 'any'}
                            onChange={() => handleArtistSelection('any')}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0"
                          />
                        </div>
                      </div>

                      {/* Individual Artists from Database */}
                      {availableStaff.map((staff) => {
                        const busy = isStaffBusy(staff)
                        return (
                          <div
                            key={staff.id}
                            className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:border-gray-300 hover:shadow-sm ${
                              busy ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => !busy && handleArtistSelection(staff.name)}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {staff.avatar ? (
                                    <img
                                      src={staff.avatar}
                                      alt={staff.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xs sm:text-sm font-medium text-white">
                                      {getStaffInitials(staff.name)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-medium text-gray-800 text-sm sm:text-base truncate">
                                      {staff.name}
                                    </h4>
                                    {busy && (
                                      <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded flex-shrink-0">
                                        Busy
                                      </span>
                                    )}
                                  </div>
                                  {staff.bio && (
                                    <div className="mt-1">
                                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                                        {staff.bio}
                                      </p>
                                    </div>
                                  )}
                                  {staff.specialties && staff.specialties.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {staff.specialties.slice(0, 2).map((specialty, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded"
                                        >
                                          {specialty}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <input
                                type="radio"
                                name="artist"
                                value={staff.name}
                                checked={selectedArtist === staff.name}
                                onChange={() => !busy && handleArtistSelection(staff.name)}
                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 pointer-events-none flex-shrink-0"
                                disabled={busy}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Date Selection - Only show when artist is selected */}
              {selectedServices.length > 0 && selectedArtist && (
                <div ref={dateSelectionRef} className="mt-6 sm:mt-8 pt-6 border-t">
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

              {/* Continue Button - Only show when date and time are selected */}
              {selectedServices.length > 0 && selectedArtist && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                  {session?.user ? (
                    <button
                      onClick={() => {
                        const params = new URLSearchParams({
                          services: selectedServices.join(','),
                          artist: selectedArtist,
                          date: reservation?.date?.toISOString(),
                          time: reservation?.time,
                        })
                        router.push(`/booking-summary?${params.toString()}`)
                      }}
                      disabled={!reservation?.date || !reservation?.time}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                        reservation?.date && reservation?.time
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {reservation?.date && reservation?.time
                        ? `Continue with ${selectedServices.length} Service${
                            selectedServices.length > 1 ? 's' : ''
                          } ($${totalPrice})`
                        : 'Select Date & Time to Continue'}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {reservation?.date && reservation?.time ? (
                        <>
                          <p className="text-center text-gray-600 text-xs sm:text-sm mb-3">
                            Please sign in to complete your booking
                          </p>
                          <Link
                            href={`/login?redirect=/booking-summary&services=${selectedServices.join(
                              ','
                            )}&artist=${selectedArtist}&date=${reservation?.date?.toISOString()}&time=${
                              reservation?.time
                            }`}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors block text-center text-sm sm:text-base"
                          >
                            Sign In to Book ({selectedServices.length} Service
                            {selectedServices.length > 1 ? 's' : ''} - ${totalPrice})
                          </Link>
                          <p className="text-center text-xs sm:text-sm text-gray-500">
                            Do not have an account?{' '}
                            <Link
                              href="/signup"
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Create one here
                            </Link>
                          </p>
                        </>
                      ) : (
                        <div className="text-center text-gray-500 py-3 text-xs sm:text-sm">
                          Please select a date and time to continue with your booking
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Salon Info */}
          <div className="bg-white rounded-lg shadow-sm border h-fit">
            {/* Logo */}
            <div className="p-4 sm:p-6 border-b">
              <img src="/logo.png" alt="NAILAHOLICS" className="w-full rounded-lg mb-4" />
            </div>

            {/* Contact Info */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">
                  CONTACT US
                </h3>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div>4B Pitt St</div>
                  <div className="text-gray-600">Mortdale NSW 2223</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">
                  PHONE
                </h4>
                <div className="text-xs sm:text-sm text-gray-600">(02) 9579 1881</div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">
                  E-MAIL
                </h4>
                <div className="text-xs sm:text-sm text-gray-600 break-all">
                  nailaholics.official@gmail.com
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">
                  WORKING HOURS
                </h4>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="flex-shrink-0">Monday - Wednesday</span>
                    <span className="text-gray-600 text-right">9:00AM to 5:30PM</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="flex-shrink-0">Thursday</span>
                    <span className="text-gray-600 text-right">9:00AM to 7:00PM</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="flex-shrink-0">Friday</span>
                    <span className="text-gray-600 text-right">9:00AM to 5:30PM</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="flex-shrink-0">Saturday</span>
                    <span className="text-gray-600 text-right">9:00AM to 5:30PM</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="flex-shrink-0">Sunday</span>
                    <span className="text-gray-600 text-right">10:00AM to 5:00PM</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">
                  FOLLOW US
                </h4>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <a
                    href="https://www.instagram.com/nailaholics.mortdale"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Instagram className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">@nailaholics.mortdale</span>
                  </a>
                  <a
                    href="https://www.facebook.com/p/Nailaholics-Nails-Beauty-61571777837251/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Facebook className="w-4 h-4 flex-shrink-0" />
                    <span className="break-words">Nailaholics Nails & Beauty</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
