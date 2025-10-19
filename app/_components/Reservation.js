import LoginMessage from './LoginMessage'
import ReservationForm from './ReservationForm'

async function Reservation({ session, service }) {
  return (
    <div className="grid grid-rows-2 md:grid-cols-2 border border-primary-800 min-h-[400px]">
      {session?.user ? <ReservationForm user={session.user} service={service} /> : <LoginMessage />}
    </div>
  )
}

export default Reservation
