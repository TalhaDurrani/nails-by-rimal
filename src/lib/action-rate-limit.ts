import 'server-only';
import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { headers } from 'next/headers';
import { createAdminSupabase } from '@/lib/supabase/admin';

export async function getClientKey() {
  const requestHeaders = await headers();
  // Vercel overwrites this header at its edge. Never prefer caller-supplied CF headers.
  const forwarded = process.env.VERCEL === '1'
    ? requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()
    : undefined;
  const address = forwarded && isIP(forwarded) ? forwarded : 'unknown-client';
  return createHash('sha256').update(address).digest('hex');
}

export async function allowPublicAction(scope: 'tracking' | 'newsletter' | 'contact' | 'recovery') {
  const key = await getClientKey();
  try {
    const { data, error } = await createAdminSupabase().rpc('consume_action_limit', {
      p_scope: scope, p_client_key: key,
    });
    if (error) {
      console.error('Rate limit service unavailable:', error.code);
      return false;
    }
    return data === true;
  } catch {
    return false;
  }
}
