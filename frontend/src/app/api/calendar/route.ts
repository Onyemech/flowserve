import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    // Get first and last day of the month
    const firstDay = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const lastDay = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(name, phone_number),
        service:services(name)
      `)
      .eq('user_id', user.id)
      .eq('item_type', 'service')
      .gte('event_date', firstDay)
      .lte('event_date', lastDay)
      .order('event_date', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ events: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
