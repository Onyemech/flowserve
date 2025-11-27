import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user business type
    const { data: userData } = await supabase
      .from('flowserve_users')
      .select('business_type')
      .eq('id', user.id)
      .single();

    const businessType = userData?.business_type;
    let items = [];

    if (businessType === 'real_estate') {
      const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      items = properties || [];
    } else if (businessType === 'event_planning') {
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      items = services || [];
    }

    return NextResponse.json({
      businessType,
      items,
    });
  } catch (error) {
    console.error('Inventory API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
