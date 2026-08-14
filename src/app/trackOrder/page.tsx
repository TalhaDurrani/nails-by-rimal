"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserClient } from "@supabase/ssr";

export default function TrackOrderPage() {
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<{ status: string; created_at: string; total: number; customer_name: string } | null>(null);
  const [error, setError] = useState("");

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingId.trim()) return;
    
    setLoading(true);
    setError("");
    setOrderData(null);

    // Fetch the order using the unique order_number (Tracking ID)
    const { data, error } = await supabase
      .from("orders")
      .select("status, created_at, total, customer_name")
      .eq("order_number", trackingId.trim())
      .single();

    if (error || !data) {
      setError("Order not found. Please double-check your Tracking ID.");
    } else {
      setOrderData(data);
    }
    
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Track Your Order
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your Tracking ID below to see your order status.
          </p>
        </div>
        
        <form onSubmit={handleTrackOrder} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trackingId">Tracking ID</Label>
            <Input
              id="trackingId"
              type="text"
              placeholder="e.g., NBR-123456"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? "Searching..." : "Track Order"}
          </Button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        {/* Order Details Display */}
        {orderData && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Order Details</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">Customer:</span> {orderData.customer_name}</p>
              <p><span className="font-medium">Date Placed:</span> {new Date(orderData.created_at).toLocaleDateString()}</p>
              <p><span className="font-medium">Total Amount:</span> Rs. {orderData.total}</p>
              <div className="mt-4 flex items-center justify-between bg-white p-3 rounded border">
                <span className="font-medium">Current Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider 
                  ${orderData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    orderData.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                    orderData.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {orderData.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}