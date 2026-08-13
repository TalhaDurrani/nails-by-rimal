"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <AlertCircle className="h-10 w-10 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Something Went Wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-muted-foreground">
              There was an issue processing your order.
            </p>
            <p className="text-muted-foreground">
              Your cart is still available. Please try again.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => router.push("/cart")}
              className="w-full cursor-pointer"
            >
              Back to Cart
            </Button>
            <Button
              onClick={() => router.push("/checkout")}
              variant="outline"
              className="w-full cursor-pointer"
            >
              Try Checkout Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
