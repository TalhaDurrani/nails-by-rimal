'use server';

import { z } from 'zod';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { literalEmailPattern } from '@/lib/email-pattern';
import { allowPublicAction } from '@/lib/action-rate-limit';

const emailSchema = z.email().max(254).transform((value) => value.trim().toLowerCase());

export async function subscribeToNewsletter(input: unknown) {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: 'Enter a valid email address.' };
  }

  if (!(await allowPublicAction('newsletter'))) {
    return { success: false as const, error: 'Unable to subscribe right now. Please try again later.' };
  }
  const supabase = createAdminSupabase();
  const { data: existing, error: findError } = await supabase
    .from('newsletter_subscribers')
    .select('id')
    .ilike('email', literalEmailPattern(parsed.data))
    .maybeSingle();
  if (findError) {
    console.error('Newsletter lookup failed:', findError);
    return { success: false as const, error: 'Unable to subscribe right now.' };
  }
  const operation = existing
    ? supabase
        .from('newsletter_subscribers')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    : supabase.from('newsletter_subscribers').insert({
        email: parsed.data,
        is_active: true,
      });
  const { error } = await operation;
  if (error && error.code !== '23505') {
    console.error('Newsletter subscription failed:', error);
    return { success: false as const, error: 'Unable to subscribe right now.' };
  }
  return { success: true as const };
}
