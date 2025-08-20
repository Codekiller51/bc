"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MainNav() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="flex items-center">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
          <div className="px-7">
            <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
              <span className="font-bold text-xl">Brand Connect</span>
            </Link>
          </div>
          <nav className="flex flex-col gap-4 text-lg font-medium mt-8 px-7">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Home
            </Link>
            <Link
              href="/search"
              onClick={() => setIsOpen(false)}
              className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Find Creatives
            </Link>
            <Link
              href="/blog"
              onClick={() => setIsOpen(false)}
              className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Blog
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              About
            </Link>
            <Link
              href="/testimonials"
              onClick={() => setIsOpen(false)}
              className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Testimonials
            </Link>
            <Link
              href="/help"
              onClick={() => setIsOpen(false)}
              className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Help
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Contact
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Register
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <nav className="hidden lg:flex gap-6 ml-6">
        <Link
          href="/"
          className="text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          Home
        </Link>
        <Link
          href="/search"
          className="text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          Find Creatives
        </Link>
        <Link
          href="/blog"
          className="text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          Blog
        </Link>
        <Link
          href="/about"
          className="text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          About
        </Link>
        <Link
          href="/testimonials"
          className="text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          Testimonials
        </Link>
        <Link
          href="/help"
          className="text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          Help
        </Link>
        <Link
          href="/contact"
          className="text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          Contact
        </Link>
      </nav>
    </div>
  )
}
