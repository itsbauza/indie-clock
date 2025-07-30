import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8">
                <Image
                  src="/logo.svg"
                  alt="Indie Grid Logo"
                  width={32}
                  height={32}
                  className="w-full h-full"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 font-space-grotesk tracking-tight">
                Indie Grid
              </span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Turn your GitHub contributions into a vibrant pixel display on your desk. Stay motivated and celebrate every commit.
            </p>
            
            {/* Creator */}
            <div className="flex items-center space-x-2">
              <img
                src="https://pbs.twimg.com/profile_images/1899738748155232256/Hc38ZOYn_400x400.jpg"
                alt="Llorenç Bauza"
                className="w-6 h-6 rounded-full"
              />
              <a 
                href="https://twitter.com/itsbauza" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-indigo-600 text-sm transition-colors flex items-center space-x-1"
              >
                <span>Made by @itsbauza</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  How it Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://github.com/yourusername/indie-clock" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-indigo-600 text-sm transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/yourusername/indie-clock/issues" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-indigo-600 text-sm transition-colors"
                >
                  Report Issues
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/yourusername/indie-clock/discussions" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-indigo-600 text-sm transition-colors"
                >
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-indigo-600 text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Indie Grid. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <p className="text-gray-500 text-sm">
                Built with ❤️ for developers
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}