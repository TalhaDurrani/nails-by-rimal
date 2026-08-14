"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#FBF6F2] pt-[70px] pb-[30px] border-t border-[#EFCFC9]">
      <div className="max-w-[1220px] mx-auto px-6 md:px-10">
        {/* Foot Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pb-[50px]">
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
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link href="/products?filter=new" className="text-[13.5px] text-[#7A6C68] transition-colors duration-300 hover:text-[#BE7681]">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[13.5px] text-[#7A6C68] transition-colors duration-300 hover:text-[#BE7681]">
                  Gift Cards
                </Link>
              </li>
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h5 className="text-[11.5px] tracking-[0.18em] uppercase text-[#B48A4E] mb-5 font-semibold">Support</h5>
            <ul className="space-y-3">
              <li>
                <Link href="/contact#sizing" className="text-[13.5px] text-[#7A6C68] transition-colors duration-300 hover:text-[#BE7681]">
                  Sizing Guide
                </Link>
              </li>
              <li>
                <Link href="/contact#application" className="text-[13.5px] text-[#7A6C68] transition-colors duration-300 hover:text-[#BE7681]">
                  Application Guide
                </Link>
              </li>
              <li>
                <Link href="/contact#shipping" className="text-[13.5px] text-[#7A6C68] transition-colors duration-300 hover:text-[#BE7681]">
                  Shipping Info
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
                <Link href="/#reviews" className="text-[13.5px] text-[#7A6C68] transition-colors duration-300 hover:text-[#BE7681]">
                  Reviews
                </Link>
              </li>
              <li>
                <Link href="/contact#wholesale" className="text-[13.5px] text-[#7A6C68] transition-colors duration-300 hover:text-[#BE7681]">
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
          <div className="flex gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-[34px] h-[34px] rounded-full border border-[#B48A4E] flex items-center justify-center text-[13px] text-[#B48A4E] transition-all duration-300 hover:bg-[#B48A4E] hover:text-white"
            >
              IG
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-[34px] h-[34px] rounded-full border border-[#B48A4E] flex items-center justify-center text-[13px] text-[#B48A4E] transition-all duration-300 hover:bg-[#B48A4E] hover:text-white"
            >
              TT
            </a>
            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-[34px] h-[34px] rounded-full border border-[#B48A4E] flex items-center justify-center text-[13px] text-[#B48A4E] transition-all duration-300 hover:bg-[#B48A4E] hover:text-white"
            >
              WA
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
