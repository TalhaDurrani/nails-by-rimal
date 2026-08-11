"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get("order_number");
  const [isCopied, setIsCopied] = useState(false);

  const copyOrderNumber = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setIsCopied(true);
      toast.success("Order number copied!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Thank you for your order. Your press-on nails will be prepared and sent shortly.
            </p>
            
            {orderNumber && (
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-600 mb-2">Order Number</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="font-mono text-lg font-bold">{orderNumber}</p>
                  <button
                    onClick={copyOrderNumber}
                    className="p-2 hover:bg-slate-200 rounded transition"
                    title="Copy order number"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">💳 Payment Method</p>
              <p className="text-sm text-blue-800">
                Cash on Delivery (COD) — Please pay when your order arrives
              </p>
            </div>

            <p className="text-sm text-slate-600">
              Check your email for the order confirmation and tracking details.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={() => router.push("/")} className="w-full cursor-pointer">
              Continue Shopping
            </Button>
            <Button
              onClick={() => router.push("/profile")}
              variant="outline"
              className="w-full cursor-pointer"
            >
              View My Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
