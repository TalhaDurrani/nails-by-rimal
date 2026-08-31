import { redirect } from 'next/navigation';
import Image from 'next/image';
import { createServerSupabase } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/getAccessToAdminScreen');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username, email')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') redirect('/');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="w-full min-w-0 flex-1 overflow-x-hidden pt-20 lg:ml-64 lg:pt-0 xl:ml-72">
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-lg sm:px-6 sm:py-4">
          <div className="flex items-center justify-end">
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Admin"
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-medium text-gray-900">
                  {profile.username || 'Admin'}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {profile.email || user.email || 'Administrator'}
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
