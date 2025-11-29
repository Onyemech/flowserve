import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface RoutingResult {
    adminId: string | null
    action: 'route' | 'ask_selection' | 'ask_referral' | 'error'
    admins?: any[]
}

export async function determineTargetAdmin(
    supabase: any,
    customerPhone: string,
    messageText: string
): Promise<RoutingResult> {
    // 1. Check for active session
    const { data: activeSession } = await supabase
        .from('whatsapp_sessions')
        .select('user_id')
        .eq('customer_phone', customerPhone)
        .gte('last_message_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('last_message_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (activeSession) {
        console.log('Found active session with admin:', activeSession.user_id)
        return { adminId: activeSession.user_id, action: 'route' }
    }

    // 2. Check existing mappings
    const { data: mappings } = await supabase
        .from('customer_admin_mapping')
        .select('admin_id, flowserve_users!inner(*)')
        .eq('customer_phone', customerPhone)

    if (mappings && mappings.length === 1) {
        console.log('Found single mapping for customer:', mappings[0].admin_id)
        return { adminId: mappings[0].admin_id, action: 'route' }
    }

    if (mappings && mappings.length > 1) {
        console.log('Found multiple mappings for customer')
        return {
            adminId: null,
            action: 'ask_selection',
            admins: mappings.map((m: any) => m.flowserve_users)
        }
    }

    // 3. No mapping found. Try to match a business name from the message text.
    // This supports "Smart Links" where the pre-filled text is the business name or a start command.
    // Example: "Hi, I want to connect with [Business Name]"

    // We'll return 'ask_referral' but the agent will treat it as a potential search.
    // The agent should check if the message *is* a business name or *contains* one.

    return { adminId: null, action: 'ask_referral' }
}
