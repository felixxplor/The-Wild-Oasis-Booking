'use client'

import { createContext, useContext, useState } from 'react'
import { SessionProvider } from 'next-auth/react'

const ReservationContext = createContext()

const initialState = { date: undefined }

function ReservationProvider({ children }) {
  const [reservation, setReservation] = useState(initialState)
  const resetReservation = () => setReservation(initialState)

  return (
    <SessionProvider>
      <ReservationContext.Provider value={{ reservation, setReservation, resetReservation }}>
        {children}
      </ReservationContext.Provider>
    </SessionProvider>
  )
}

function useReservation() {
  const context = useContext(ReservationContext)
  if (context === undefined) throw new Error('Context was used outside provider')
  return context
}

export { ReservationProvider, useReservation }
