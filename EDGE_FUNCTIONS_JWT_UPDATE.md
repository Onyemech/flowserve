# Edge Functions JWT Verification Update

## Current Status

The following Edge Functions currently have `verify_jwt: true` and need to be updated to `verify_jwt: false`:

1. ✅ **whatsapp-webhook-receiver** - Config file created
2. ✅ **send-payment-confirmation** - Config file created  
3. ✅ **whatsapp-webhook** - Config file already exists

## Config Files Created

I've created `config.json` files for all three functions with:
```json
{
  "verify_jwt": false
}
```

### Files:
- `backend/supabase/functions/whatsapp-webhook-receiver/config.json`
- `backend/supabase/functions/send-payment-confirmation/config.json`
- `backend/supabase/functions/whatsapp-webhook/config.json` (already existed)

## Why verify_jwt: false is Needed

These functions need `verify_jwt: false` because:

1. **whatsapp-webhook** - Meta/WhatsApp doesn't send JWT tokens when calling webhooks
2. **whatsapp-webhook-receiver** - Same reason, receives webhooks from Meta
3. **send-payment-confirmation** - May be called from Paystack webhooks without JWT

## How to Deploy with Updated Settings

### Option 1: Using Supabase CLI (Recommended)

```bash
cd backend

# Deploy each function with the config.json
supabase functions deploy whatsapp-webhook-receiver
supabase functions deploy send-payment-confirmation
supabase functions deploy whatsapp-webhook
```

The CLI will automatically read the `config.json` file and apply the `verify_jwt: false` setting.

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions**
3. For each function:
   - Click on the function name
   - Go to **Settings** tab
   - Find **JWT Verification** setting
   - Toggle it to **OFF** (disabled)
   - Save changes

### Option 3: Redeploy via CLI with explicit config

```bash
cd backend

# For each function, deploy with config
supabase functions deploy whatsapp-webhook-receiver --no-verify-jwt
supabase functions deploy send-payment-confirmation --no-verify-jwt
supabase functions deploy whatsapp-webhook --no-verify-jwt
```

## Verification

After deployment, verify the settings:

```bash
supabase functions list
```

Check that `verify_jwt` is `false` for all three functions.

Or use the MCP tool:
```typescript
mcp_supabase_list_edge_functions()
```

Look for:
```json
{
  "slug": "whatsapp-webhook-receiver",
  "verify_jwt": false
}
```

## Current Functions Status

### Already have verify_jwt: false ✅
- media-cleanup-cron
- paystack-webhook
- whatsapp-agent
- cloudinary-cleanup

### Need to be updated ⚠️
- whatsapp-webhook-receiver (currently true)
- send-payment-confirmation (currently true)
- whatsapp-webhook (currently true)

## Next Steps

1. Deploy the three functions using one of the methods above
2. Verify the settings are applied
3. Test the webhooks to ensure they work without JWT verification

## Testing After Deployment

### Test whatsapp-webhook:
```bash
curl -X GET "https://lzofgtjotkmrravxhwfk.supabase.co/functions/v1/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=flowserve_webhook_verify_2025&hub.challenge=test123"
```

Should return: `test123`

### Test whatsapp-webhook-receiver:
```bash
curl -X POST "https://lzofgtjotkmrravxhwfk.supabase.co/functions/v1/whatsapp-webhook-receiver" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Should return: `{"success": true}`

## Important Notes

- The `config.json` files are now in place in the repository
- The functions need to be redeployed for the settings to take effect
- JWT verification should be disabled for webhook endpoints that receive calls from external services (Meta, Paystack, etc.)
- Internal functions that are called from your frontend should keep JWT verification enabled
