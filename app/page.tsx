import {
  ArrowRight,
  Clock3,
  Globe,
  Map,
  MessageSquareText,
  Package,
  Play,
  Send,
  ShieldCheck,
  Truck,
  TrendingUp,
} from 'lucide-react';
import { WorkflowCards } from '@/components/deliveries/WorkflowCards';
import { ValueProps } from '@/components/landing/ValueProps';
import { CallToAction } from '@/components/landing/CallToAction';
import { TrustBar } from '@/components/landing/TrustBar';
import { PricingCards } from '@/components/pricing/PricingCards';
import { KineticExplorer } from '@/components/landing/KineticExplorer';

const solutionFeatures = [
  {
    title: 'Vetted carriers',
    description: 'Built-in compliance and on-time score tracking.',
    icon: Truck,
  },
  {
    title: 'Smart routing',
    description: 'Dynamic planning across regional and national lanes.',
    icon: Map,
  },
  {
    title: 'Secure payouts',
    description: 'Escrow-backed settlements with instant verification.',
    icon: ShieldCheck,
  },
  {
    title: 'Live visibility',
    description: 'Shipment milestones stay visible to every stakeholder.',
    icon: TrendingUp,
  },
];

const precisionCards = [
  {
    title: 'Healthcare',
    description: 'Temperature-controlled, time-sensitive transport.',
    accent: 'from-cyan-500/25 to-sky-500/10',
  },
  {
    title: 'Retail & eCommerce',
    description: 'Fast fulfillment from warehouse to doorstep.',
    accent: 'from-violet-500/25 to-purple-500/10',
  },
  {
    title: 'Food & Beverage',
    description: 'Freshness-first routing and shelf-life monitoring.',
    accent: 'from-amber-500/25 to-orange-500/10',
  },
  {
    title: 'Manufacturing',
    description: 'Heavy freight coordination with precise delivery windows.',
    accent: 'from-emerald-500/25 to-teal-500/10',
  },
];

const footerColumns = [
  {
    heading: 'Platform',
    links: ['Deliveries', 'Drivers', 'Escrow', 'Pricing'],
  },
  {
    heading: 'Solutions',
    links: ['Freight', 'Warehousing', 'Fleet Ops', 'Compliance'],
  },
  {
    heading: 'Company',
    links: ['About', 'Docs', 'Contact', 'Privacy'],
  },
];

const socialLinks = [
  { label: 'LinkedIn', icon: Globe },
  { label: 'Twitter', icon: Send },
  { label: 'Instagram', icon: MessageSquareText },
  { label: 'YouTube', icon: Play },
];

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-[#050816] text-slate-100">
      <section className="bg-white px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <WorkflowCards />
        </div>
      </section>
      <section className="relative bg-gradient-to-b from-black via-gray-900 to-black text-white py-32 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <p className="uppercase tracking-widest text-blue-400 text-sm">
            Logistics Reimagined
          </p>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Deliver Anything.
            <br />
            <span className="text-blue-500">Pay Only When It Arrives.</span>
          </h1>

          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
            SwiftChain protects your deliveries using blockchain escrow. Funds
            stay locked until delivery is completed — eliminating fraud,
            disputes, and payment risks.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <button className="bg-blue-600 hover:bg-blue-700 hover:scale-[1.03] active:scale-95 transition px-8 py-4 rounded-lg font-semibold text-lg shadow-lg">
              Start Shipping Securely <ArrowRight className="inline h-5 w-5" />
            </button>

            <button className="border border-gray-600 hover:border-white hover:bg-white/10 transition px-8 py-4 rounded-lg font-semibold">
              See How It Works
            </button>
          </div>

          <p className="text-sm opacity-60 pt-4">
            Secure escrow • Instant settlement • Transparent logistics
          </p>

          <div className="pt-8">
            <KineticExplorer />
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="py-24 px-6 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-slate-900">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">
            Why Businesses Choose SwiftChain
          </h2>

          <p className="text-center text-gray-400 mb-14 max-w-2xl mx-auto">
            Traditional logistics relies on trust. SwiftChain replaces trust
            with automated blockchain guarantees.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-gray-50 p-8 rounded-2xl transition hover:-translate-y-2 hover:shadow-xl">
              <div className="text-5xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Trustless Escrow</h3>
              <p className="text-gray-600">
                Payments remain secured until delivery confirmation. Zero fraud.
                Zero uncertainty.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl transition hover:-translate-y-2 hover:shadow-xl">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Instant Settlement</h3>
              <p className="text-gray-600">
                Drivers receive payment instantly once deliveries are verified
                on-chain.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl transition hover:-translate-y-2 hover:shadow-xl">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Ultra-Low Fees</h3>
              <p className="text-gray-600">
                Reduce logistics costs with blockchain efficiency and minimal
                transaction overhead.
              </p>
            </div>
          </div>
          <ValueProps />
        </div>
      </section>

      <section className="bg-gray-100 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-slate-900">
            Powered by Secure Blockchain Infrastructure
          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Built on proven blockchain technology delivering transparency,
            speed, and guaranteed payments for every shipment.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl transition hover:shadow-lg hover:-translate-y-1">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="font-semibold text-xl mb-2 text-slate-900">
                Secure Smart Contracts
              </h3>
              <p className="text-gray-600">
                Automated escrow prevents payment manipulation.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl transition hover:shadow-lg hover:-translate-y-1">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="font-semibold text-xl mb-2 text-slate-900">
                Stellar Network Speed
              </h3>
              <p className="text-gray-600">
                Near-instant confirmation across borders.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl transition hover:shadow-lg hover:-translate-y-1">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-semibold text-xl mb-2 text-slate-900">
                Transparent Tracking
              </h3>
              <p className="text-gray-600">
                Every milestone verified permanently on-chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-900 text-white py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            How SwiftChain Works
          </h2>

          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-slate-700" />

            <div className="space-y-12">
              <div className="flex gap-6 items-start group">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 font-bold group-hover:scale-110 transition">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Create Delivery</h3>
                  <p className="opacity-80">
                    Sender locks payment into secure blockchain escrow.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start group">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 font-bold group-hover:scale-110 transition">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Driver Completes Shipment
                  </h3>
                  <p className="opacity-80">
                    Delivery progresses with transparent verification.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start group">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 font-bold group-hover:scale-110 transition">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Automatic Payment Release
                  </h3>
                  <p className="opacity-80">
                    Smart contracts instantly release funds after confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0b1020] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">
                Industry solutions
              </p>
              <h2 className="text-3xl font-bold text-white md:text-5xl">
                Independent Carriers
              </h2>
            </div>
            <button className="inline-flex items-center gap-2 self-start rounded-full border border-slate-600 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-blue-500 hover:text-white">
              Explore carriers <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <article className="relative overflow-hidden rounded-[28px] border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-950 to-[#0e172c] p-6 shadow-2xl shadow-blue-950/40">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-blue-500/20 via-cyan-400/20 to-transparent" />
              <div className="relative mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                    Fleet coverage
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-white">
                    On-demand logistics across every lane.
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
                  <Truck className="h-6 w-6" />
                </div>
              </div>

              <div className="relative flex min-h-[220px] items-end justify-between rounded-[24px] border border-slate-700 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),rgba(15,23,42,0.3)_40%,rgba(15,23,42,0.9)_100%)] p-5">
                <div className="space-y-2">
                  <p className="text-sm text-blue-200">Network coverage</p>
                  <p className="text-3xl font-bold text-white">48 regions</p>
                </div>

                <div className="relative h-28 w-52">
                  <div className="absolute bottom-0 left-4 h-16 w-28 rounded-t-[30px] bg-slate-800/90 shadow-[0_0_0_1px_rgba(148,163,184,0.25)]" />
                  <div className="absolute bottom-14 left-10 h-8 w-10 rounded-t-xl bg-slate-700" />
                  <div className="absolute bottom-8 left-7 h-10 w-4 rounded-full bg-slate-500" />
                  <div className="absolute bottom-8 right-10 h-10 w-4 rounded-full bg-slate-500" />
                  <div className="absolute bottom-2 left-20 h-6 w-14 rounded-full bg-blue-500/40" />
                  <div className="absolute bottom-0 right-3 h-6 w-10 rounded-full bg-slate-700" />
                </div>
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {solutionFeatures.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-slate-700 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/40"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/12 text-blue-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-6 text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0a0f1d] px-6 pb-24 pt-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">
              Industry solutions
            </p>
            <h2 className="text-3xl font-bold text-white md:text-5xl">
              Precision Industry Solutions
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {precisionCards.map(({ title, description, accent }, index) => (
              <article
                key={title}
                className={`group rounded-[28px] border border-slate-700 bg-gradient-to-br ${accent} p-5 text-white shadow-lg shadow-slate-950/35 ${
                  index === 0 || index === 3 ? 'xl:col-span-1' : ''
                }`}
              >
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950/60 text-blue-300">
                  {index % 2 === 0 ? <Package className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
                </div>
                <div className="mb-6 h-px w-12 bg-white/20" />
                <h3 className="mb-3 text-2xl font-semibold">{title}</h3>
                <p className="text-sm leading-6 text-slate-200">{description}</p>
                <div className="mt-8 flex items-center gap-2 text-sm font-medium text-blue-200">
                  Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-600 text-white py-24 text-center px-6">
        <h2 className="text-4xl font-bold mb-6">
          Stop Losing Money to Delivery Disputes
        </h2>

        <p className="opacity-90 mb-8 max-w-xl mx-auto">
          Join the future of logistics where payments are secure, automated, and
          guaranteed.
        </p>

        <button className="bg-white text-blue-600 px-10 py-4 rounded-lg font-bold text-lg hover:scale-105 active:scale-95 transition">
          Launch Your First Delivery <ArrowRight className="inline h-5 w-5" />
        </button>
      <section className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <CallToAction />
        </div>
      </section>

      <footer className="bg-[#030712] px-6 py-14 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_0.9fr_0.9fr_0.9fr]">
            <div className="max-w-xs">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-lg font-bold text-blue-400">
                  SC
                </div>
                <div>
                  <p className="text-lg font-semibold">SwiftChain</p>
                </div>
              </div>
              <p className="text-sm leading-7 text-slate-300">
                Blockchain-powered logistics infrastructure that secures every
                shipment and settlement.
              </p>
            </div>

            {footerColumns.map(({ heading, links }) => (
              <div key={heading}>
                <h4 className="mb-4 text-base font-semibold text-white">{heading}</h4>
                <ul className="space-y-3 text-sm text-slate-300">
                  {links.map((link) => (
                    <li key={link} className="transition hover:text-blue-400">
                      {link}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-6 border-t border-slate-800 pt-6 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} SwiftChain. All rights reserved.
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 transition hover:border-blue-500 hover:text-blue-400"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
