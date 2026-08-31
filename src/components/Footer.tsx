"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#FBF6F2] pt-[70px] pb-[30px] border-t border-[#EFCFC9]">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        {/* Foot Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-[50px]">
          {/* Brand Info */}
          <div className="flex gap-[14px] items-start">
            <Image
              src="/images/logo.png"
              alt="Nails by Rimal logo"
              width={56}
              height={56}
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <div className="brand-name font-serif text-[19px] tracking-[0.03em] text-[#2E2624] leading-[1.1] font-semibold">
                Nails <span className="block font-sans text-[9.5px] tracking-[0.34em] text-[#7A6C68] font-medium mt-[6px] uppercase">BY RIMAL</span>
              </div>
              <p className="text-[13px] text-[#7A6C68] leading-[1.7] mt-[10px] max-w-[260px]">
                Handmade press-on nails, designed and packed in small batches for a salon finish at home.
              </p>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h5 className="text-[11.5px] tracking-[0.18em] uppercase text-[#B48A4E] mb-5 font-semibold">Shop</h5>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-[13.5px] text-[#7A6C68] transition-colors duration-300 hover:text-[#BE7681]">
                  All Sets
                </Link>
              </li>
              <li>
                <Link href="/#bestsellers" className="text-[13.5px] text-[#7A6C68] transition-colors duration-300 hover:text-[#BE7681]">
                  Featured Sets
                </Link>
              </li>
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h5 className="text-[11.5px] tracking-[0.18em] uppercase text-[#B48A4E] mb-5 font-semibold">Support</h5>
            <ul className="space-y-3">
              <li>
                <Link href="/trackOrder" className="text-[13.5px] text-[#7A6C68] transition-colors duration-300 hover:text-[#BE7681]">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[13.5px] text-[#7A6C68] transition-colors duration-300 hover:text-[#BE7681]">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio links */}
          <div>
            <h5 className="text-[11.5px] tracking-[0.18em] uppercase text-[#B48A4E] mb-5 font-semibold">Studio</h5>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-[13.5px] text-[#7A6C68] transition-colors duration-300 hover:text-[#BE7681]">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[13.5px] text-[#7A6C68] transition-colors duration-300 hover:text-[#BE7681]">
                  Wholesale
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Gold Rule */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#C7A25F] to-transparent"></div>

        {/* Foot Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-7 mt-[28px] text-[12px] text-[#7A6C68] gap-4">
          <div>&copy; {new Date().getFullYear()} Nails by Rimal. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
