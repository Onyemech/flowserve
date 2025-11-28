import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get usage data
    const { data: usage, error: usageError } = await supabase
      .from('cloudinary_usage')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      throw usageError;
    }

    // Get cleanup logs (if you have a cleanup_logs table)
    // For now, return empty array
    const cleanupLogs: any[] = [];

    return NextResponse.json({
      usage: usage || {
        total_storage_mb: 0,
        total_assets: 0,
        last_updated: new Date().toISOString(),
      },
      cleanupLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
