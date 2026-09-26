'use client'

import React from 'react'
import Link from 'next/link'

// Navigation links data
const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Support', href: '/support' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Contact', href: '/contact' },
  { label: 'FAQs', href: '/faq' },
]

// Social icons data
const socialLinks = [
  { label: 'Twitter', href: 'https://twitter.com/swiftchain', icon: '🐦' },
  { label: 'GitHub', href: 'https://github.com/swiftchain', icon: '🐙' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/swiftchain', icon: '🔗' },
  { label: 'Discord', href: 'https://discord.gg/swiftchain', icon: '💬' },
]

export function MobileFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-8 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-md">
        {/* Navigation links - 2x2 grid on mobile */}
        <nav className="mb-6 grid grid-cols-2 gap-2" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:active:bg-gray-700"
              style={{ minHeight: '44px' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Social icons - centered */}
        <div className="mb-4 flex justify-center gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              aria-label={social.label}
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <span className="sr-only">{social.label}</span>
              <span role="img" aria-hidden="true">
                {social.icon}
              </span>
            </a>
          ))}
        </div>

        {/* Copyright - centered */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {currentYear} SwiftChain. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default MobileFooter
