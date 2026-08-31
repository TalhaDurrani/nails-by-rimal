const SUPABASE_REQUEST_TIMEOUT_MS = 12_000;

export function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
) {
  const timeoutSignal = AbortSignal.timeout(SUPABASE_REQUEST_TIMEOUT_MS);
  const signal = init.signal
    ? AbortSignal.any([init.signal, timeoutSignal])
    : timeoutSignal;

  return fetch(input, { ...init, signal });
}
