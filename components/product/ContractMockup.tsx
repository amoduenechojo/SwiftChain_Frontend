'use client';

/**
 * ContractMockup — MacOS-style IDE window showcasing a Solidity escrow
 * contract on the product/marketing page, with copy-to-clipboard.
 *
 * Architecture: ContractMockup (Component) → useContractMockup (Hook) →
 *   contractMockupService (Service) → Backend
 */

import { useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-solidity';
import 'prismjs/components/prism-typescript';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { useContractMockup } from '@/hooks/useContractMockup';
import './ContractMockup.css';

export function ContractMockup() {
  const { snippet, isLoading, isError, isCopied, refetch, copyCode } =
    useContractMockup();

  const highlightedHtml = useMemo(() => {
    if (!snippet) return '';
    const grammar = Prism.languages[snippet.language] ?? Prism.languages.solidity;
    return Prism.highlight(snippet.code, grammar, snippet.language);
  }, [snippet]);

  return (
    <div
      className="w-full max-w-2xl overflow-hidden rounded-xl border border-gray-800 bg-[#1e1e1e] shadow-2xl"
      role="group"
      aria-label="Smart contract code preview"
    >
      {/* MacOS-style window frame */}
      <div className="flex items-center gap-2 border-b border-gray-800 bg-[#2d2d2d] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#FF5F56]" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-[#27C93F]" aria-hidden="true" />

        <span className="flex-1 truncate text-center font-mono text-xs text-gray-400">
          {snippet?.fileName ?? 'contract.sol'}
        </span>

        <button
          type="button"
          onClick={() => void copyCode()}
          disabled={!snippet}
          aria-label="Copy contract code"
          className={[
            'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-[#2d2d2d]',
            snippet
              ? 'text-gray-400 hover:bg-white/10 hover:text-gray-200'
              : 'cursor-not-allowed text-gray-600',
          ].join(' ')}
        >
          {isCopied ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[420px] overflow-auto px-4 py-4">
        {isLoading && (
          <div className="space-y-2.5" aria-label="Loading contract code">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-3 animate-pulse rounded bg-gray-700/50"
                style={{ width: `${60 + ((i * 13) % 35)}%` }}
              />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 py-8 text-center"
          >
            <AlertCircle className="h-6 w-6 text-red-400" aria-hidden="true" />
            <p className="text-sm text-gray-400">
              Failed to load the contract preview.
            </p>
            <button
              type="button"
              onClick={refetch}
              className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && snippet && (
          <pre className="contract-mockup-code overflow-x-auto font-mono text-[13px] leading-relaxed">
            <code
              className={`language-${snippet.language}`}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        )}
      </div>
    </div>
  );
}
