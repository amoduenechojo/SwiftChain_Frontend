'use client';

import { useId, useState, type FormEvent } from 'react';
import { AtSign, ChevronDown, Code2, MessageCircle } from 'lucide-react';
import { useFooter, useNewsletterSubscribe } from '@/hooks/useFooter';
import type { FooterSection } from '@/services/footerService';

const FALLBACK_SECTIONS: FooterSection[] = [
  {
    id: 'infrastructure',
    title: 'Infrastructure',
    links: [
      { id: 'escrow-engine', label: 'Escrow Engine', href: '/infrastructure/escrow' },
      { id: 'fleet-network', label: 'Fleet Network', href: '/infrastructure/fleet' },
      { id: 'stellar-settlement', label: 'Stellar Settlement', href: '/infrastructure/stellar' },
    ],
  },
  {
    id: 'resources',
    title: 'Resources',
    links: [
      { id: 'documentation', label: 'Documentation', href: '/docs' },
      { id: 'api-reference', label: 'API Reference', href: '/docs/api' },
      { id: 'faq', label: 'FAQ', href: '/faq' },
      { id: 'support', label: 'Support', href: '/support' },
    ],
  },
  {
    id: 'connect',
    title: 'Connect',
    links: [
      { id: 'twitter', label: 'Twitter/X', href: 'https://twitter.com/swiftchain' },
      { id: 'github', label: 'GitHub', href: 'https://github.com/swiftchain' },
      { id: 'discord', label: 'Discord', href: 'https://discord.gg/swiftchain' },
      { id: 'contact', label: 'Contact', href: '/contact' },
    ],
  },
];

const LEGAL_LINKS = [
  { id: 'privacy', label: 'Privacy Policy', href: '/legal/privacy' },
  { id: 'terms', label: 'Terms of Service', href: '/legal/terms' },
  { id: 'cookies', label: 'Cookie Policy', href: '/legal/cookies' },
];

const CONNECT_ICONS: Record<string, typeof AtSign> = {
  twitter: AtSign,
  github: Code2,
  discord: MessageCircle,
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

interface FooterAccordionSectionProps {
  section: FooterSection;
  isOpen: boolean;
  onToggle: () => void;
}

function FooterAccordionSection({
  section,
  isOpen,
  onToggle,
}: FooterAccordionSectionProps) {
  const panelId = `footer-panel-${section.id}`;

  return (
    <div className="border-b border-gray-800 dark:border-gray-800 sm:border-none">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between py-4 text-left font-semibold text-white sm:pointer-events-none sm:cursor-default sm:pb-3 sm:pt-0"
      >
        <span>{section.title}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform sm:hidden ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>
      <ul
        id={panelId}
        className={`space-y-2 overflow-hidden text-sm text-gray-400 transition-all sm:block sm:max-h-none sm:pb-0 sm:opacity-100 ${
          isOpen ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 opacity-0 sm:opacity-100'
        }`}
      >
        {section.links.map((link) => {
          const Icon = CONNECT_ICONS[link.id];
          return (
            <li key={link.id}>
              <a
                href={link.href}
                className="inline-flex items-center gap-2 transition-colors hover:text-blue-400"
              >
                {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function GlobalFooter() {
  const { content, isLoading } = useFooter();
  const { subscribe, isPending, isSuccess, isError, reset } =
    useNewsletterSubscribe();

  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const emailInputId = useId();

  const sections = content?.sections ?? FALLBACK_SECTIONS;

  const handleToggleSection = (sectionId: string) => {
    setOpenSectionId((current) => (current === sectionId ? null : sectionId));
  };

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reset();

    if (!isValidEmail(email)) {
      setValidationError('Enter a valid email address.');
      return;
    }

    setValidationError(null);

    try {
      await subscribe(email);
      setEmail('');
    } catch {
      // handled via isError from the mutation
    }
  };

  return (
    <footer className="bg-black text-white dark:bg-black">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-2 sm:grid-cols-3 sm:gap-10">
          {isLoading && !content
            ? sections.map((section) => (
                <div key={section.id} className="hidden sm:block">
                  <h4 className="mb-3 font-semibold text-white">{section.title}</h4>
                  <div className="space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-800" />
                    <div className="h-3 w-20 animate-pulse rounded bg-gray-800" />
                    <div className="h-3 w-28 animate-pulse rounded bg-gray-800" />
                  </div>
                </div>
              ))
            : null}
          {sections.map((section) => (
            <FooterAccordionSection
              key={section.id}
              section={section}
              isOpen={openSectionId === section.id}
              onToggle={() => handleToggleSection(section.id)}
            />
          ))}
        </div>

        <div className="mt-12 border-t border-gray-800 pt-10">
          <h4 className="font-semibold text-white">Stay in the loop</h4>
          <p className="mt-2 max-w-md text-sm text-gray-400">
            Subscribe for product updates and logistics infrastructure news.
          </p>

          <form
            onSubmit={(event) => void handleSubscribe(event)}
            className="mt-4 flex max-w-md flex-col gap-2 sm:flex-row"
            noValidate
          >
            <label htmlFor={emailInputId} className="sr-only">
              Email address
            </label>
            <input
              id={emailInputId}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isPending}
              className="whitespace-nowrap rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>

          <div className="mt-2 min-h-[1.25rem] text-sm" role="status" aria-live="polite">
            {validationError ? (
              <p className="text-red-400">{validationError}</p>
            ) : isError ? (
              <p className="text-red-400">
                Something went wrong. Please try again.
              </p>
            ) : isSuccess ? (
              <p className="text-green-400">You&apos;re subscribed. Thank you!</p>
            ) : null}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-gray-800 pt-8 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.id}>
                <a href={link.href} className="transition-colors hover:text-blue-400">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p>© {new Date().getFullYear()} SwiftChain. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default GlobalFooter;
