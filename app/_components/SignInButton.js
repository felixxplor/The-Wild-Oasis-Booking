import Image from 'next/image'
import { signInAction } from '../_lib/actions'

function SignInButton({ callbackUrl }) {
  return (
    <form action={signInAction} className="mt-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <button className="bg-transparent border border-[#414141] text-[#414141] text-xs tracking-[.22em] h-[55px] w-[240px] transition duration-300 hover:bg-[#414141] hover:text-white flex items-center justify-center gap-4">
        <div>
          <Image
            src="https://authjs.dev/img/providers/google.svg"
            alt="Google logo"
            height="20"
            width="20"
          />
        </div>
        <span>Continue with Google</span>
      </button>
    </form>
  )
}

export default SignInButton
