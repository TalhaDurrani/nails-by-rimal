import type { Metadata } from 'next';
import { Jost, Playfair_Display } from 'next/font/google';
import './globals.css';

// Existing Context Providers
import { ThemeProvider } from '@/components/theme-provider';
import { TanStackQueryProvider } from '@/lib/providers/query-provider';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { GuestCartProvider } from '@/context/GuestCartContext';

// UI Layout Components
import { Navbar } from '@/components/Navbar';
import { MainLayout } from '@/components/MainLayout';
import { Footer } from '@/components/Footer';

const jost = Jost({ 
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500']
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-head',
  style: ['normal', 'italic'],
  weight: ['400', '600']
});

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
    <html lang="en" className={`${jost.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TanStackQueryProvider>
            <AuthProvider>
              <GuestCartProvider>
                <CartProvider>
                  
                  {/* Removed SidebarProvider so it stops pushing content to the right */}
                  <Navbar />
                  <MainLayout>
                    {children}
                  </MainLayout>
                  <Footer />

                </CartProvider>
              </GuestCartProvider>
            </AuthProvider>
          </TanStackQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}