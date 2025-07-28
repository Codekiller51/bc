import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logos/logo-transparent.png"
                alt="Brand Connect Logo"
                width={120}
                height={30}
                priority
              />
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Bridging clients with creative talent across Tanzania
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium text-sm">For Clients</h3>
            <nav className="flex flex-col space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/search" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                Find Creatives
              </Link>
              <Link href="/how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                How It Works
              </Link>
              <Link href="/testimonials" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                Testimonials
              </Link>
              <Link href="/pricing" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                Pricing
              </Link>
            </nav>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium text-sm">For Creatives</h3>
            <nav className="flex flex-col space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/register/creative" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                Join as a Creative
              </Link>
              <Link href="/success-stories" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                Success Stories
              </Link>
              <Link href="/resources" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                Resources
              </Link>
              <Link href="/faq" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                FAQ
              </Link>
            </nav>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Company</h3>
            <nav className="flex flex-col space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                About Us
              </Link>
              <Link href="/blog" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                Blog
              </Link>
              <Link href="/contact" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                Contact
              </Link>
              <Link href="/help" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                Help Center
              </Link>
              <Link href="/careers" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                Careers
              </Link>
              <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Brand Connect. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 md:mt-0">Made with ❤️ in Tanzania</p>
        </div>
      </div>
    </footer>
  )
}
