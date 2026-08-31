import type { Metadata } from 'next';
import './globals.css';

// Existing Context Providers
import { ThemeProvider } from '@/components/theme-provider';
import { TanStackQueryProvider } from '@/lib/providers/query-provider';
import { CartProvider } from '@/context/CartContext';

// UI Layout Components
import { MainLayout } from '@/components/MainLayout';
import { AdminLayoutWrapper } from '@/components/AdminLayoutWrapper';

export const metadata: Metadata = {
  title: 'Nails by Rimal | Luxury Nail Care',
  description: 'Experience luxury nail care and bespoke artistry.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <TanStackQueryProvider>
            <CartProvider>
              <AdminLayoutWrapper>
                <MainLayout>{children}</MainLayout>
              </AdminLayoutWrapper>
            </CartProvider>
          </TanStackQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
