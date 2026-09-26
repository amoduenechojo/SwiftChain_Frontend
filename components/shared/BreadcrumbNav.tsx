'use client';

/**
 * BreadcrumbNav — Dynamic breadcrumb navigation.
 *
 * Intercepts the current router pathname and renders a human-readable
 * trail, mapping raw UUID/numeric slugs (e.g. /escrow/123) to friendly
 * labels (e.g. "Escrow > View Contract") instead of showing the raw URL.
 *
 * Architecture: BreadcrumbNav (Component) -> useBreadcrumbs (Hook) ->
 *              breadcrumbService -> Backend
 */

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BreadcrumbNav: React.FC = () => {
  const breadcrumbs = useBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex items-center space-x-2 text-sm font-medium"
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center">
            {index !== 0 && (
              <ChevronRight className="mx-2 h-4 w-4 shrink-0 text-slate-400" />
            )}

            {breadcrumb.isLast ? (
              <span className="max-w-[200px] truncate font-semibold text-indigo-600">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className={cn(
                  'flex items-center text-slate-500 transition-colors duration-200 hover:text-indigo-600',
                  index === 0 && 'rounded-md p-1 hover:bg-slate-100',
                )}
              >
                {index === 0 && <Home className="mr-1 h-4 w-4" />}
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;
