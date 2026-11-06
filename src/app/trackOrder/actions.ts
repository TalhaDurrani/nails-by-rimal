'use server';

import { z } from 'zod';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { literalEmailPattern } from '@/lib/email-pattern';
import { allowPublicAction } from '@/lib/action-rate-limit';

const trackingSchema = z.object({
  trackingId: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^NBR-[A-Z0-9]{6,16}$/),
  email: z.email().max(254).transform((value) => value.trim().toLowerCase()),
});

export async function trackOrderAction(input: unknown) {
  const parsed = trackingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: 'Enter a valid tracking ID and email address.' };
  }

  if (!(await allowPublicAction('tracking'))) {
    return { success: false as const, error: 'Unable to look up orders right now. Please try again later.' };
  }
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from('orders')
    .select('status, created_at, total, customer_name')
    .eq('order_number', parsed.data.trackingId)
    .ilike('customer_email', literalEmailPattern(parsed.data.email))
    .maybeSingle();

  if (error) console.error('Order tracking query failed:', error);
  if (error || !data) {
    return {
      success: false as const,
      error: 'Order not found. Check both your tracking ID and checkout email.',
    };
  }

  return { success: true as const, order: data };
}
