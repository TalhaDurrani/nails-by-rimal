'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { requestAdminRecovery, updateAdminPassword } from './actions';

export default function RecoveryForm({ updating, expired }: { updating: boolean; expired: boolean }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(expired ? 'That recovery link has expired. Request a new email.' : '');
  const [complete, setComplete] = useState(false);
  return <section className="mx-auto my-16 w-full max-w-md rounded-2xl bg-white p-8 shadow">
    <h1 className="mb-4 text-2xl">Admin password recovery</h1>
    <p className="mb-6 text-sm">Request a recovery email, then follow its link in this browser to choose a private password.</p>
    <form className="space-y-4" onSubmit={async (event) => {
      event.preventDefault();
      if (busy) return;
      const form = new FormData(event.currentTarget);
      if (updating && form.get('password') !== form.get('confirmation')) {
        setMessage('Passwords must match.'); return;
      }
      setBusy(true);
      try {
        const result = updating ? await updateAdminPassword(form.get('password')) : await requestAdminRecovery(form.get('email'));
        setMessage(result.message);
        if (updating && result.success) setComplete(true);
      } catch { setMessage('Unable to complete this request. Please try again later.'); }
      finally { setBusy(false); }
    }}>
      {!updating ? <label className="block text-sm">Administrator email
        <Input name="email" type="email" autoComplete="email" maxLength={254} required />
      </label>
      : null}
      {updating ? <>
      <label className="block text-sm">New password (16–128 characters)
        <Input name="password" type="password" autoComplete="new-password" minLength={16} maxLength={128} required />
      </label>
      <label className="block text-sm">Confirm new password
        <Input name="confirmation" type="password" autoComplete="new-password" minLength={16} maxLength={128} required />
      </label>
      </> : null}
      <Button type="submit" className="w-full" disabled={busy || complete}>{busy ? 'Please wait…' : updating ? 'Change password' : 'Send recovery email'}</Button>
    </form>
    {message && <p role="status" className="my-4 text-sm">{message}</p>}
    <Link className="mt-6 inline-block underline" href="/getAccessToAdminScreen">Back to admin sign in</Link>
  </section>;
}
