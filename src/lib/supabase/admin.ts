import 'server-only';

import { createAdminClient } from '@supabase/server/core';
import type { Database } from '@/types/supabase';

export function createAdminSupabase() {
  return createAdminClient<Database>();
}
