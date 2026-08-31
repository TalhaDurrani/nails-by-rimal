"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingCart,
  Users,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Sparkles,
  Layers,
  Gift,
} from "lucide-react";

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const navItems = [
    {
      href: "/admin",
      icon: LayoutDashboard,
      label: "Dashboard",
      badge: null,
    },
    {
      href: "/admin/products",
      icon: Package,
      label: "Products",
      badge: null,
    },
    {
      href: "/admin/categories",
      icon: TrendingUp,
      label: "Categories",
      badge: null,
    },
    {
      href: "/admin/variants",
      icon: Layers,
      label: "Variants",
      badge: null,
    },
    {
      href: "/admin/bundles",
      icon: Gift,
      label: "Bundles",
      badge: null,
    },
    {
      href: "/admin/gift-packing",
      icon: Gift,
      label: "Gift Packing",
      badge: null,
    },
    {
      href: "/admin/box-options",
      icon: Package,
      label: "Box Options",
      badge: null,
    },
    {
      href: "/admin/orders",
      icon: ShoppingCart,
      label: "Orders",
      badge: null,
    },
    {
      href: "/admin/users",
      icon: Users,
      label: "Users",
      badge: null,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-white border-r border-gray-200 flex-col fixed left-0 top-0 h-screen shadow-sm">
        {/* Brand Section */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative">
              <Image
                src="/images/logo.png"
                alt="Nails by Rimal"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover shadow-lg ring-2 ring-[#D89AA0]/20"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-gray-900">
                Nails by Rimal
              </h2>
              <p className="text-xs text-gray-500 font-medium tracking-wide">ADMIN PANEL</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive(item.href)
                  ? "bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white shadow-lg shadow-[#D89AA0]/25"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive(item.href) ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
              <span className="font-medium flex-1">{item.label}</span>
              {item.badge && (
                <Badge className="bg-white/20 text-white border-none text-xs font-normal">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            <span className="font-medium">Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white shadow-lg shadow-[#D89AA0]/30"
        size="icon"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="relative">
              <Image
                src="/images/logo.png"
                alt="Nails by Rimal"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover shadow-lg ring-2 ring-[#D89AA0]/20"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-gray-900">
                Nails by Rimal
              </h2>
              <p className="text-xs text-gray-500 font-medium tracking-wide">ADMIN PANEL</p>
            </div>
          </Link>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive(item.href)
                  ? "bg-gradient-to-r from-[#D89AA0] to-[#B48A4E] text-white shadow-lg shadow-[#D89AA0]/25"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive(item.href) ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
              <span className="font-medium flex-1">{item.label}</span>
              {item.badge && (
                <Badge className="bg-white/20 text-white border-none text-xs font-normal">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            <span className="font-medium">Back to Store</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
