"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const trackingId = searchParams.get("trackingId") || searchParams.get("order_number");

  return (
    <div className="max-w-md w-full text-center space-y-6 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-center">
        <CheckCircle2 className="h-20 w-20 text-green-500" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900">Order Placed!</h1>
      <p className="text-gray-600">
        Thank you for shopping with Nails by Rimal. Your order is being processed.
      </p>

      {trackingId && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
          <p className="text-sm text-gray-500 mb-1">Your Order Number / Tracking ID</p>
          <p className="text-2xl font-black tracking-widest text-primary">{trackingId}</p>
        </div>
      )}

      <p className="text-sm text-gray-500 mt-4">
        We have sent an order confirmation to your email. You can use your Tracking ID to check the status of your order at any time.
      </p>

      <div className="pt-6 flex flex-col space-y-3">
        <Link href="/trackOrder" className="w-full">
          <Button variant="outline" className="w-full">Track Order</Button>
        </Link>
        <Link href="/" className="w-full">
          <Button className="w-full">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Suspense fallback={<div className="text-center p-8">Loading order details...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}