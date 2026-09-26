'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDown, Copy, Check, LogOut } from 'lucide-react';
import { useAccountMenu } from '@/hooks/useAccountMenu';

/**
 * AccountMenu — wallet status dropdown for the application header.
 *
 * Layered Architecture:
 *   AccountMenu (Component) → useAccountMenu (Hook) → useWallet → walletService (Service)
 *
 * Features:
 *   - Truncated Stellar public key in the trigger button
 *   - Full address revealed in the dropdown header
 *   - Copy address to clipboard with a 2-second confirmation flash
 *   - Disconnect wallet (calls backend API via service layer)
 *   - Keyboard accessible: arrow keys navigate items, Enter activates, Escape closes
 *   - Closes on outside click (Headless UI Menu behaviour)
 *
 * Renders nothing when no wallet is connected.
 */
export function AccountMenu() {
  const {
    address,
    isConnected,
    isCopied,
    isDisconnecting,
    truncatedAddress,
    copyAddress,
    disconnect,
  } = useAccountMenu();

  if (!isConnected || !address) return null;

  return (
    <Menu as="div" className="relative inline-block text-left">
      {/* Trigger button — shows green dot + truncated public key */}
      <MenuButton
        aria-label="Wallet account menu"
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-green-500"
          aria-hidden="true"
        />
        <span
          className="max-w-[120px] truncate font-mono text-xs"
          title={address}
        >
          {truncatedAddress}
        </span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className="shrink-0 text-slate-400 transition ui-open:rotate-180"
        />
      </MenuButton>

      {/* Dropdown panel.

          `anchor` renders MenuItems into a portal at document.body, so it
          escapes the header's stacking context. The z-index must still sit
          above Leaflet's control panes (`.leaflet-top`/`.leaflet-bottom` ship
          with z-index:1000), which otherwise clip the menu on map pages whose
          container doesn't trap its own stacking context. `z-[9999]` matches
          the app's top-layer convention (see OfflineBanner) and clears 1000. */}
      <MenuItems
        anchor="bottom end"
        className="z-[9999] mt-2 w-64 origin-top-right rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:ring-white/10"
      >
        {/* Full address header — not a focusable menu item */}
        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Connected Wallet
          </p>
          <p
            className="mt-1 break-all font-mono text-xs text-slate-800 dark:text-slate-200"
            title={address}
          >
            {address}
          </p>
        </div>

        <div className="py-1">
          {/* Copy address */}
          <MenuItem>
            <button
              type="button"
              onClick={() => void copyAddress()}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition data-[focus]:bg-slate-100 data-[focus]:text-slate-900 dark:text-slate-300 dark:data-[focus]:bg-slate-700 dark:data-[focus]:text-white"
            >
              {isCopied ? (
                <Check size={15} className="text-green-500" aria-hidden="true" />
              ) : (
                <Copy size={15} aria-hidden="true" />
              )}
              <span>{isCopied ? 'Address Copied!' : 'Copy Address'}</span>
            </button>
          </MenuItem>

          {/* Disconnect wallet */}
          <MenuItem>
            <button
              type="button"
              disabled={isDisconnecting}
              onClick={() => void disconnect()}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition disabled:cursor-not-allowed disabled:opacity-60 data-[focus]:bg-red-50 data-[focus]:text-red-700 dark:text-red-400 dark:data-[focus]:bg-red-900/30 dark:data-[focus]:text-red-300"
            >
              {isDisconnecting ? (
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden="true"
                />
              ) : (
                <LogOut size={15} aria-hidden="true" />
              )}
              <span>{isDisconnecting ? 'Disconnecting…' : 'Disconnect Wallet'}</span>
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}
