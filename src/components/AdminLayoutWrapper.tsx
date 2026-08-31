"use client";

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAdminLoginRoute = pathname === '/getAccessToAdminScreen';

  if (isAdminRoute || isAdminLoginRoute) {
    // For admin routes, only render children without Navbar and Footer
    return <>{children}</>;
  }

  // For non-admin routes, render children with Navbar and Footer
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
