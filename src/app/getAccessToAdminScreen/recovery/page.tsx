import RecoveryForm from './RecoveryForm';

export default async function AdminRecoveryPage({ searchParams }: {
  searchParams: Promise<{ mode?: string; error?: string }>;
}) {
  const params = await searchParams;
  return <RecoveryForm updating={params.mode === 'password'} expired={params.error === 'expired'} />;
}
