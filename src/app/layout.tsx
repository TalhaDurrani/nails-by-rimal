import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { GuestCartProvider } from "@/context/GuestCartContext";
import { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import Sidebar  from "@/components/Sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TanStackQueryProvider } from "@/lib/providers/query-provider";
import { Toaster } from "sonner";
import { MainLayout } from "@/components/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Nails by Rimal - Handmade Press-On Nails",
  description: "Premium handcrafted press-on nails from Pakistan. Cash on Delivery available.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <title>Nails by Rimal</title>
        <meta name="description" content="Premium handcrafted press-on nails. COD available." />
      </head>
      <body className="bg-background min-h-screen">
        <ErrorBoundary>
          <TanStackQueryProvider>
            <AuthProvider>
              <GuestCartProvider>
                <CartProvider>
                  <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                  >
                    <SidebarProvider>
                      <Sidebar />
                      <SidebarInset>
                        <Navbar />
                        <MainLayout>{children}</MainLayout>
                      </SidebarInset>
                    </SidebarProvider>
                  </ThemeProvider>
                </CartProvider>
              </GuestCartProvider>
            </AuthProvider>
          </TanStackQueryProvider>
        </ErrorBoundary>
        <Toaster
          theme="light" // or "dark" or "system"
          toastOptions={{
            unstyled: false,
            classNames: {
              error: "bg-red-500 text-white border-red-600",
              success: "bg-green-500 text-white border-green-600",
              warning: "bg-yellow-500 text-black border-yellow-600",
              info: "bg-blue-500 text-white border-blue-600",
            },
          }}
        />
        
      </body>
    </html>
  );
}
