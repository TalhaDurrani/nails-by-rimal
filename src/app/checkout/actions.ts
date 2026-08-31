'use server';

import { z } from 'zod';
import { createOrderService } from '@/services/order/createOrder';
import { sendOrderConfirmationEmail } from '@/lib/nodemailer';
import { headers } from 'next/headers';
import { createHash } from 'node:crypto';
import { getCheckoutOptions } from '@/services/storefront/storefrontOptions';

const customerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254),
  phone: z.string().trim().min(7).max(30),
  street: z.string().trim().min(5).max(250),
  city: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().max(20),
  province: z.string().trim().min(2).max(100),
});

const itemsSchema = z
  .array(
    z.object({
      variantId: z.number().int().positive(),
      quantity: z.number().int().min(1).max(20),
      bundleId: z.uuid().optional(),
      bundleKey: z.uuid().optional(),
    }).refine(
      (item) => Boolean(item.bundleId) === Boolean(item.bundleKey),
      'Bundle data is incomplete.',
    ),
  )
  .min(1)
  .max(20)
  .refine(
    (items) => items.reduce((sum, item) => sum + item.quantity, 0) <= 50,
    'The order contains too many items.',
  );

const requestKeySchema = z.uuid();

const extrasSchema = z.object({
  boxOptionId: z.uuid().optional(),
  giftPackingId: z.uuid().optional(),
  giftMessage: z.string().trim().max(300).optional(),
});

export async function loadCheckoutOptions() {
  return getCheckoutOptions();
}

export async function processGuestCheckout(
  customerInput: unknown,
  itemsInput: unknown,
  requestKeyInput: unknown,
  extrasInput: unknown,
) {
  const customerResult = customerSchema.safeParse(customerInput);
  const itemsResult = itemsSchema.safeParse(itemsInput);
  const requestKeyResult = requestKeySchema.safeParse(requestKeyInput);
  const extrasResult = extrasSchema.safeParse(extrasInput);

  if (!customerResult.success || !itemsResult.success || !requestKeyResult.success || !extrasResult.success) {
    return { success: false as const, error: 'Please check your checkout details and try again.' };
  }

  try {
    const headerStore = await headers();
    const forwardedAddresses = headerStore.get('x-forwarded-for')?.split(',');
    const forwarded = forwardedAddresses?.[forwardedAddresses.length - 1]?.trim();
    const clientAddress =
      headerStore.get('cf-connecting-ip') ||
      headerStore.get('x-real-ip') ||
      forwarded ||
      `email:${customerResult.data.email.toLowerCase()}`;
    const clientKey = createHash('sha256').update(clientAddress).digest('hex');

    const order = await createOrderService(
      requestKeyResult.data,
      customerResult.data,
      itemsResult.data,
      clientKey,
      null,
      extrasResult.data,
    );

    let emailSent = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await sendOrderConfirmationEmail(
          customerResult.data.email,
          customerResult.data.name,
          order.trackingId,
          order.total,
        );
        emailSent = true;
      } catch (emailError) {
        console.error('Order was placed, but confirmation email failed:', emailError);
      }
    }

    return {
      success: true as const,
      trackingId: order.trackingId,
      total: order.total,
      emailSent,
    };
  } catch (error) {
    console.error('Checkout failed:', error);
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Unable to place the order.',
    };
  }
}
