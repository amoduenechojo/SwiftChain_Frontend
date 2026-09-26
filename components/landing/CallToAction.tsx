'use client';

import { useCallToAction } from '@/hooks/useCallToAction';

export function CallToAction() {
  const {
    form,
    isSubmitting,
    isSuccess,
    responseMessage,
    error,
    onSubmit,
    resetForm,
  } = useCallToAction();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = form;

  return (
    <section
      aria-label="Early access sign-up"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 py-24 shadow-2xl md:py-32"
    >
      {/* Decorative background orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 right-0 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl text-center">
        {/* Eyebrow text */}
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
          Limited Early Access
        </p>

        {/* Headline */}
        <h2 className="mb-4 text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
          Ready to{' '}
          <span className="bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
            Chain
          </span>{' '}
          Your Logistics?
        </h2>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-xl text-lg text-blue-100/90 md:text-xl">
          Join hundreds of forward-thinking businesses already securing their
          deliveries with blockchain-powered escrow.
        </p>

        {/* Success state */}
        {isSuccess && responseMessage && (
          <div
            role="status"
            className="mx-auto max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 text-center text-white backdrop-blur-sm"
          >
            <div className="mb-3 text-4xl">🎉</div>
            <p className="text-lg font-semibold">{responseMessage}</p>
            <p className="mt-2 text-sm text-blue-100/80">
              We&apos;ll be in touch soon.
            </p>
          </div>
        )}

        {/* Form — hidden on success */}
        {!isSuccess && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row sm:items-start"
          >
            <div className="flex-1">
              <label htmlFor="cta-email" className="sr-only">
                Email address
              </label>
              <input
                id="cta-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your work email"
                className={`w-full rounded-xl border bg-white/10 px-5 py-4 text-base text-white placeholder-blue-200/60 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/60 ${
                  errors.email
                    ? 'border-red-300 focus:ring-red-400'
                    : 'border-white/20 focus:border-white/40'
                }`}
                {...register('email')}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={
                  errors.email ? 'cta-email-error' : undefined
                }
              />
              {errors.email && (
                <p
                  id="cta-email-error"
                  role="alert"
                  className="mt-1.5 text-left text-sm text-red-200"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (isDirty && !isValid)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-blue-700 shadow-lg transition-all duration-200 hover:scale-[1.03] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  <span>Sending…</span>
                </>
              ) : (
                'Get Access →'
              )}
            </button>
          </form>
        )}

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="mx-auto mt-6 max-w-md rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200 backdrop-blur-sm"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={resetForm}
              className="mt-3 text-sm font-semibold text-white underline underline-offset-2 transition hover:text-blue-100"
            >
              Try again
            </button>
          </div>
        )}

        {/* Trust indicators */}
        <p className="mt-8 text-sm text-blue-200/60">
          🔒 No spam. Unsubscribe anytime. Join 2,500+ logistics professionals.
        </p>
      </div>
    </section>
  );
}
