"use server";

import { createOrderService } from "@/services/order/createOrder";
import { sendOrderConfirmationEmail } from "@/lib/nodemailer";

export async function processGuestCheckout(formData: any, cartItems: any[], cartTotal: number) {
  try {
    // 1. Call the service to save the order to Supabase
    const { trackingId } = await createOrderService(formData, cartItems, cartTotal);

    // 2. Send the confirmation email
    try {
      await sendOrderConfirmationEmail(
        formData.email,
        formData.name,
        trackingId,
        cartTotal
      );
    } catch (emailError) {
      console.error("Email failed to send, but order was placed:", emailError);
      // We don't throw an error here because the order was already successfully saved
    }

    // 3. Return success to the frontend
    return { success: true, trackingId };
    
  } catch (error: any) {
    console.error("Checkout failed:", error);
    return { success: false, error: error.message };
  }
}