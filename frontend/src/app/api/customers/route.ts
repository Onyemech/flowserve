import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('whatsapp_sessions')
      .select('customer_phone, last_message_at, session_data')
      .eq('user_id', user.id)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Transform to customer format
    const customers = data?.map((session: any) => ({
      phone: session.customer_phone,
      last_contact: session.last_message_at,
      messages_count: session.session_data?.messages?.length || 0,
    })) || [];

    return NextResponse.json({ customers });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
