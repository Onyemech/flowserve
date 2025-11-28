import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call the Supabase edge function for cleanup
    const { data, error } = await supabase.functions.invoke('cloudinary-cleanup', {
      body: { user_id: user.id },
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      deleted: data?.deleted || 0,
      storage_freed_mb: data?.storage_freed_mb || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
