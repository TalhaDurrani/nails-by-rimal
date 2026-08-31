'use client';

import { useState } from 'react';
import { subscribeToNewsletter } from '@/app/actions/newsletter';

export function NewsletterForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    const form = event.currentTarget;
    const email = new FormData(form).get('email');
    const result = await subscribeToNewsletter(email);
    if (result.success) {
      form.reset();
      setStatus('success');
      setMessage('Subscribed — welcome to the atelier.');
    } else {
      setStatus('error');
      setMessage(result.error);
    }
  };

  return (
    <>
      <form className="nl-form" onSubmit={submit}>
        <input name="email" type="email" placeholder="Your email address" required />
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
      {message && (
        <p role="status" className={status === 'error' ? 'text-red-200' : undefined}>
          {message}
        </p>
      )}
    </>
  );
}
