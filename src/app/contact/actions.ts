'use server';

import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { z } from 'zod';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { transporter } from '@/lib/nodemailer';

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(254).transform((value) => value.trim().toLowerCase()),
  subject: z.enum(['Order Enquiry', 'Sizing Help', 'Wholesale', 'Something Else']),
  message: z.string().trim().min(10).max(3000),
});

export async function submitContactMessage(input: unknown) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: 'Please check all message fields.' };
  }

  const headerStore = await headers();
  const forwardedAddresses = headerStore.get('x-forwarded-for')?.split(',');
  const forwarded = forwardedAddresses?.[forwardedAddresses.length - 1]?.trim();
  const address =
    headerStore.get('cf-connecting-ip') ||
    headerStore.get('x-real-ip') ||
    forwarded ||
    `email:${parsed.data.email}`;
  const clientKey = createHash('sha256').update(address).digest('hex');
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const supabase = createAdminSupabase();
  const { count, error: countError } = await supabase
    .from('contact_messages')
    .select('id', { count: 'exact', head: true })
    .eq('client_key', clientKey)
    .gte('created_at', since);

  if (countError) {
    console.error('Unable to check contact rate limit:', countError);
    return { success: false as const, error: 'Unable to send your message right now.' };
  }
  if ((count || 0) >= 5) {
    return { success: false as const, error: 'Please wait before sending another message.' };
  }

  const { error } = await supabase.from('contact_messages').insert({
    ...parsed.data,
    client_key: clientKey,
  });
  if (error) {
    console.error('Unable to store contact message:', error);
    return { success: false as const, error: 'Unable to send your message right now.' };
  }
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: parsed.data.email,
        subject: `[Website] ${parsed.data.subject}`,
        text: `From: ${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.message}`,
      });
    } catch (mailError) {
      console.error('Contact message was saved, but email notification failed:', mailError);
    }
  }
  return { success: true as const };
}
