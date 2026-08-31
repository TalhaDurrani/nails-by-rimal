"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export function Navbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    { label: "Bundles", href: "/bundles" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Track Order", href: "/trackOrder" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FCF1ED]/85 backdrop-blur-[14px] border-b border-transparent">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-4 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="brand flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Nails by Rimal logo"
            width={52}
            height={52}
            className="w-[52px] h-[52px] rounded-full object-cover shadow-[0_4px_14px_rgba(180,138,78,0.25)]"
          />
          <div className="brand-name font-serif text-[19px] tracking-[0.03em] text-[#2E2624] leading-[1.1] font-semibold">
            Nails{" "}
            <span className="block font-sans text-[9.5px] tracking-[0.34em] text-[#7A6C68] font-medium mt-[3px] uppercase">
              BY RIMAL &nbsp;•&nbsp; PRESS-ON
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block">
          <ul className="flex gap-[38px] text-[13px] tracking-[0.06em] uppercase font-light">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative pb-1 transition-colors duration-300 ${
                      isActive
                        ? "text-[#BE7681] font-normal after:w-full"
                        : "text-[#2E2624] hover:text-[#BE7681] after:w-0"
                    } after:content-[''] after:absolute after:left-0 after:bottom-0 after:height-[1px] after:bg-[#B48A4E] after:transition-[width] after:duration-350 hover:after:w-full`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-[22px]">
          <Link href="/cart" className="icon-btn relative text-[18px] text-[#2E2624] transition-colors duration-300 hover:text-[#BE7681]" aria-label="Cart">
            <ShoppingBag className="w-5 h-5 stroke-[1.25]" />
            {totalItems > 0 && (
              <span className="absolute -top-[8px] -right-[10px] bg-[#BE7681] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-sans">
                {totalItems}
              </span>
            )}
          </Link>
          
          {/* Mobile Menu Burger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-[#2E2624] hover:text-[#BE7681] transition-colors duration-300"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Gold Rule Line */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#C7A25F] to-transparent"></div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-[#FCF1ED] border-b border-[#F4DAD3] px-6 py-6 absolute top-[calc(100%+1px)] left-0 w-full shadow-lg z-50">
          <ul className="flex flex-col gap-4 text-[14px] tracking-[0.1em] uppercase font-light">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <li key={link.href} className="border-b border-[#F4DAD3] pb-2 last:border-none last:pb-0">
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block w-full ${
                      isActive ? "text-[#BE7681] font-normal" : "text-[#2E2624]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
