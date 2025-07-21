import Image from 'next/image'
import Link from 'next/link'

export const Navbar = () => {
  return (
    <nav>
      <div className="px-4 py-3 lg:px-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            passHref
            className="object-cover opacity-50 transition-opacity hover:opacity-100"
          >
            {/* Logo placeholder */}
            <Image src="/logo.svg" alt="Background pattern" width={24} height={24} priority />
          </Link>
        </div>
      </div>
    </nav>
  )
}
