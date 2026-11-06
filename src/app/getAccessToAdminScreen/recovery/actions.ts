'use server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { allowPublicAction } from '@/lib/action-rate-limit';
import { literalEmailPattern } from '@/lib/email-pattern';

export async function requestAdminRecovery(input: unknown) {
  const email = z.email().max(254).safeParse(input);
  const message = 'If that address belongs to an administrator, a recovery email will arrive shortly. Open it in this browser.';
  if (!email.success) return { success: false, message: 'Enter a valid email address.' };
  if (!(await allowPublicAction('recovery'))) return { success: true, message };
  const { data } = await createAdminSupabase().from('profiles').select('profile_id')
    .eq('role', 'admin').ilike('email', literalEmailPattern(email.data)).maybeSingle();
  if (data) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3100');
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
      redirectTo: new URL('/getAccessToAdminScreen/recovery/callback', origin).href,
    });
    if (error) console.error('Recovery email failed:', error.code);
  }
  return { success: true, message };
}

export async function updateAdminPassword(input: unknown) {
  const password = z.string().min(16).max(128).safeParse(input);
  if (!password.success) return { success: false, message: 'Use a password between 16 and 128 characters.' };
  const supabase = await createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { success: false, message: 'Open a fresh recovery link first.' };
  const { data: profile } = await supabase.from('profiles').select('role').eq('profile_id', user.id).maybeSingle();
  if (profile?.role !== 'admin') return { success: false, message: 'Administrator access required.' };
  const { error: updateError } = await supabase.auth.updateUser({ password: password.data });
  if (updateError) return { success: false, message: 'Unable to change the password. Request a fresh recovery email and try again.' };
  await supabase.auth.signOut({ scope: 'global' });
  return { success: true, message: 'Password changed. Sign in again with your new password.' };
}
