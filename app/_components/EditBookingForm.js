// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { ArrowLeft, Calendar, Clock, User, DollarSign } from 'lucide-react'
// import { updateBooking } from '@/app/_lib/actions'
// import SubmitButton from './SubmitButton'

// function EditBookingForm({ booking, services, staff, userEmail }) {
//   const router = useRouter()

//   // Initialize state with current booking data
//   const [selectedServices, setSelectedServices] = useState(
//     Array.isArray(booking.serviceIds) ? booking.serviceIds : []
//   )
//   const [selectedStaff, setSelectedStaff] = useState(booking.staffId || '')
//   const [date, setDate] = useState(
//     booking.date ? new Date(booking.date).toISOString().split('T')[0] : ''
//   )
//   const [time, setTime] = useState(
//     booking.startTime ? new Date(booking.startTime).toTimeString().slice(0, 5) : ''
//   )
//   const [notes, setNotes] = useState(booking.notes || '')
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [error, setError] = useState('')

//   // Calculate totals
//   const calculateTotals = () => {
//     const selectedServiceObjects = services.filter((s) => selectedServices.includes(s.id))

//     const totalPrice = selectedServiceObjects.reduce((sum, service) => {
//       const price = service.discount
//         ? service.regularPrice - service.discount
//         : service.regularPrice
//       return sum + price
//     }, 0)

//     const totalDuration = selectedServiceObjects.reduce((sum, service) => sum + service.duration, 0)

//     return { totalPrice, totalDuration }
//   }

//   const { totalPrice, totalDuration } = calculateTotals()

//   // Toggle service selection
//   const toggleService = (serviceId) => {
//     setSelectedServices((prev) =>
//       prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
//     )
//   }

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     try {
//       setIsSubmitting(true)
//       setError('')

//       // Validation
//       if (selectedServices.length === 0) {
//         throw new Error('Please select at least one service')
//       }

//       if (!date || !time) {
//         throw new Error('Please select date and time')
//       }

//       // Check if date is at least 24 hours away
//       const bookingDateTime = new Date(`${date}T${time}`)
//       const hoursUntil = (bookingDateTime - new Date()) / (1000 * 60 * 60)

//       if (hoursUntil < 24) {
//         throw new Error('Booking must be at least 24 hours in advance')
//       }

//       const updateData = {
//         bookingId: booking.id,
//         serviceIds: selectedServices,
//         staffId: selectedStaff || null,
//         date,
//         time,
//         totalPrice,
//         totalDuration,
//         notes: notes.trim(),
//       }

//       console.log('Updating booking with:', updateData)

//       const result = await updateBooking(updateData)

//       if (result.success) {
//         router.push('/appointments')
//       } else {
//         setError(result.error || 'Failed to update booking')
//         setIsSubmitting(false)
//       }
//     } catch (err) {
//       console.error('Error updating booking:', err)
//       setError(err.message || 'Failed to update booking')
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <div>
//       {/* Header */}
//       <div className="mb-8">
//         <button
//           onClick={() => router.back()}
//           className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
//         >
//           <ArrowLeft size={20} />
//           Back to Appointments
//         </button>
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Appointment</h1>
//         <p className="text-gray-600">
//           Modify your booking details - changes must be made at least 24 hours in advance
//         </p>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <p className="text-red-600">{error}</p>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="bg-white rounded-lg shadow-sm border p-6">
//           {/* Current Booking Info */}
//           <div className="mb-6 p-4 bg-blue-50 rounded-lg">
//             <h3 className="font-medium text-gray-800 mb-2">Current Booking</h3>
//             <p className="text-sm text-gray-600">Booking #{booking.id}</p>
//             <p className="text-sm text-gray-600">
//               Status: <span className="font-medium">{booking.status}</span>
//             </p>
//           </div>

//           {/* Services Selection */}
//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-700 mb-3">
//               Select Services *
//             </label>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               {services.map((service) => {
//                 const isSelected = selectedServices.includes(service.id)
//                 const price = service.discount
//                   ? service.regularPrice - service.discount
//                   : service.regularPrice

//                 return (
//                   <button
//                     key={service.id}
//                     type="button"
//                     onClick={() => toggleService(service.id)}
//                     className={`p-4 border-2 rounded-lg text-left transition ${
//                       isSelected
//                         ? 'border-blue-600 bg-blue-50'
//                         : 'border-gray-200 hover:border-gray-300'
//                     }`}
//                   >
//                     <div className="flex justify-between items-start mb-2">
//                       <h4 className="font-medium text-gray-900">{service.name}</h4>
//                       <div className="text-right">
//                         {service.discount ? (
//                           <>
//                             <span className="text-sm line-through text-gray-500">
//                               ${service.regularPrice}
//                             </span>
//                             <div className="font-semibold text-green-600">${price}</div>
//                           </>
//                         ) : (
//                           <div className="font-semibold">${price}</div>
//                         )}
//                       </div>
//                     </div>
//                     {service.description && (
//                       <p className="text-sm text-gray-600 mb-2">{service.description}</p>
//                     )}
//                     <p className="text-sm text-gray-500">{service.duration} minutes</p>
//                   </button>
//                 )
//               })}
//             </div>
//           </div>

//           {/* Staff Selection */}
//           <div className="mb-6">
//             <label htmlFor="staff" className="block text-sm font-medium text-gray-700 mb-2">
//               Select Artist
//             </label>
//             <select
//               id="staff"
//               value={selectedStaff}
//               onChange={(e) => setSelectedStaff(e.target.value)}
//               disabled={isSubmitting}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
//             >
//               <option value="">Any Available Artist</option>
//               {staff.map((member) => (
//                 <option key={member.id} value={member.id}>
//                   {member.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Date Selection */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//             <div>
//               <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
//                 <Calendar className="inline w-4 h-4 mr-1" />
//                 Date *
//               </label>
//               <input
//                 type="date"
//                 id="date"
//                 value={date}
//                 onChange={(e) => setDate(e.target.value)}
//                 min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
//                 disabled={isSubmitting}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
//               />
//             </div>

//             <div>
//               <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
//                 <Clock className="inline w-4 h-4 mr-1" />
//                 Time *
//               </label>
//               <input
//                 type="time"
//                 id="time"
//                 value={time}
//                 onChange={(e) => setTime(e.target.value)}
//                 disabled={isSubmitting}
//                 required
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
//               />
//             </div>
//           </div>

//           {/* Notes */}
//           <div className="mb-6">
//             <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
//               Special Requests or Notes
//             </label>
//             <textarea
//               id="notes"
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//               disabled={isSubmitting}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
//               rows={4}
//               placeholder="Any allergies, preferences, or special requirements..."
//               maxLength={500}
//             />
//             <p className="text-xs text-gray-500 mt-1">{notes.length}/500 characters</p>
//           </div>

//           {/* Summary */}
//           {selectedServices.length > 0 && (
//             <div className="p-4 bg-gray-50 rounded-lg mb-6">
//               <h3 className="font-medium text-gray-800 mb-3">Booking Summary</h3>
//               <div className="space-y-2">
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Services:</span>
//                   <span className="font-medium">{selectedServices.length}</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-600">Total Duration:</span>
//                   <span className="font-medium">{totalDuration} minutes</span>
//                 </div>
//                 <div className="flex justify-between text-lg font-semibold pt-2 border-t">
//                   <span>Total Price:</span>
//                   <span className="text-blue-600">${totalPrice}</span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Submit Button */}
//           <div className="flex gap-4">
//             <button
//               type="button"
//               onClick={() => router.back()}
//               disabled={isSubmitting}
//               className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isSubmitting || selectedServices.length === 0}
//               className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isSubmitting ? 'Updating...' : 'Update Booking'}
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   )
// }

// export default EditBookingForm
