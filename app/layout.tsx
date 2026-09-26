import './global.css';
import OfflineBanner from '@/components/ui/OfflineBanner';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Providers } from './providers';
import { NotificationProvider } from '@/context/NotificationContext';
import { NotificationCenter } from '@/components/layout/NotificationCenter';
import TopLoader from '@/components/ui/TopLoader';
import CommandPalette from '@/components/ui/CommandPalette';
import ToastProvider from '@/components/providers/ToastProvider';
import ModalProvider from '@/components/providers/ModalProvider';
import { GlobalFooter } from '@/components/shared/GlobalFooter';
import { themeService } from '@/services/themeService';

export const metadata = {
  title: 'SwiftChain',
  description: 'Blockchain-Powered Logistics Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeService.getThemeScript() }}
        />
      </head>
      <body>
        <ModalProvider>
          <Providers>
            <NotificationProvider>
              <ToastProvider>
                <OfflineBanner />
                <div
                  style={{
                    position: 'fixed',
                    right: '1rem',
                    top: '1rem',
                    zIndex: 50,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <NotificationCenter />
                  <ThemeToggle />
                </div>
                <TopLoader />
                <CommandPalette />
                {children}
                <GlobalFooter />
              </ToastProvider>
            </NotificationProvider>
          </Providers>
        </ModalProvider>
      </body>
    </html>
  );
}