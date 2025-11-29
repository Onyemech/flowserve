import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const businessName = searchParams.get('name');

        if (!businessName) {
            return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
        }

        const supabase = await createClient();

        // Check if business name already exists
        const { data, error } = await supabase
            .from('flowserve_users')
            .select('id')
            .eq('business_name', businessName)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            console.error('Error checking business name:', error);
            throw error;
        }

        return NextResponse.json({ exists: !!data });
    } catch (error: any) {
        console.error('Business name check error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
