import Link from 'next/link'

function NotFound() {
  return (
    <main className="pt-10 text-center space-y-6 mt-4">
      <h1 className="text-2xl mt-10 text-primary-custom-gray">This page could not be found :(</h1>
      <Link
        href="/"
        className="inline-block bg-[#f3ede8] text-primary-custom-gray px-6 py-3 text-lg"
      >
        Go back home
      </Link>
    </main>
  )
}

export default NotFound
