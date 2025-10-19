import NavToggle from './NavToggle'
import { auth } from '@/app/_lib/auth'

async function Header() {
  const session = await auth()

  return (
    <header className="">
      <NavToggle session={session} />
    </header>
  )
}

export default Header
