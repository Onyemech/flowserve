# 🚀 Meta WhatsApp Business Setup Checklist

**System Status:** ✅ Ready for Meta Integration  
**Last Updated:** December 4, 2025

---

## ✅ PRE-REQUISITES (COMPLETED)

- [x] Dashboard fully functional
- [x] Database configured
- [x] API routes working
- [x] Booking system implemented
- [x] Payment flow ready
- [x] Supabase MCP configured
- [x] Environment files ready

---

## 📋 META SETUP STEPS

### Step 1: Create Meta Business Account
- [ ] Go to [Meta Business Suite](https://business.facebook.com/)
- [ ] Create or select your business
- [ ] Verify business information

### Step 2: Set Up WhatsApp Business
- [ ] Go to [Meta for Developers](https://developers.facebook.com/)
- [ ] Create a new app or select existing
- [ ] Add WhatsApp product to your app
- [ ] Complete business verification (if required)

### Step 3: Get Phone Number
- [ ] Add a phone number to your WhatsApp Business
- [ ] Verify the phone number
- [ ] Note down the **Phone Number ID**

### Step 4: Get Access Token
- [ ] Go to WhatsApp > API Setup
- [ ] Generate a **Permanent Access Token**
- [ ] Copy the token (keep it secure!)
- [ ] Note down the **Business Account ID**

### Step 5: Configure Webhook
- [ ] In WhatsApp > Configuration
- [ ] Set Callback URL: `https://YOUR_DOMAIN/api/whatsapp/webhook`
- [ ] Set Verify Token: (create a random secure string)
- [ ] Subscribe to webhook fields:
  - [x] messages
  - [x] message_status (optional)

### Step 6: Update Environment Variables

#### Backend (.env)
```bash
# Meta WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_random_secure_token_here

# Already configured:
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
CLOUDINARY_CLOUD_NAME=flowservecloud
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PAYSTACK_SECRET_KEY=your_paystack_secret
```

#### Frontend (.env.local)
```bash
# Already configured:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=flowservecloud
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=flowserve_unsigned
NEXT_PUBLIC_APP_URL=https://your-domain.com
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### Step 7: Deploy & Test
- [ ] Deploy backend Edge Functions to Supabase
- [ ] Deploy frontend to Vercel/your hosting
- [ ] Verify webhook is accessible
- [ ] Test webhook verification

### Step 8: Test WhatsApp Integration
- [ ] Send a test message to your WhatsApp Business number
- [ ] Verify webhook receives the message
- [ ] Verify AI responds correctly
- [ ] Test property/service listing
- [ ] Test payment link generation
- [ ] Test booking flow

---

## 🔧 DEPLOYMENT COMMANDS

### Deploy Backend Edge Functions
```bash
cd backend
supabase functions deploy whatsapp-webhook
supabase functions deploy whatsapp-agent
```

### Deploy Frontend
```bash
cd frontend
npm run build
# Deploy to Vercel or your hosting
```

---

## 🧪 TESTING CHECKLIST

### Basic Tests:
- [ ] Send "Hi" → Should get welcome message
- [ ] Send "Show properties" → Should list properties
- [ ] Send "Show services" → Should list services
- [ ] Request property details → Should show details with images
- [ ] Request payment → Should generate Paystack link

### Booking Tests (Event Planning):
- [ ] Request service booking → Should check availability
- [ ] Book available date → Should create order + mark date as booked
- [ ] Try to book same date → Should show "date not available"
- [ ] Cancel booking → Should remove date from booked_dates

### Payment Tests:
- [ ] Generate payment link → Should create order
- [ ] Complete payment → Should update order status
- [ ] Manual payment → Should allow admin to mark as received

---

## 📊 MONITORING

### After Going Live:
- [ ] Monitor Supabase logs
- [ ] Monitor Edge Function logs
- [ ] Check error rates
- [ ] Monitor response times
- [ ] Track customer interactions

### Supabase Logs:
```bash
# View Edge Function logs
supabase functions logs whatsapp-webhook
supabase functions logs whatsapp-agent
```

---

## 🚨 TROUBLESHOOTING

### Webhook Not Receiving Messages:
1. Check webhook URL is correct
2. Verify webhook is subscribed to "messages"
3. Check Edge Function logs
4. Verify access token is valid

### AI Not Responding:
1. Check OpenAI API key
2. Check Edge Function logs
3. Verify Supabase connection
4. Check user has properties/services

### Booking Not Working:
1. Check database trigger is active
2. Verify service has booked_dates field
3. Check order creation
4. Monitor Edge Function logs

### Payment Links Not Working:
1. Verify Paystack keys
2. Check order creation
3. Verify callback URL
4. Check payment webhook

---

## 📞 SUPPORT RESOURCES

### Meta Documentation:
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Webhook Setup](https://developers.facebook.com/docs/whatsapp/webhooks)
- [Message Templates](https://developers.facebook.com/docs/whatsapp/message-templates)

### Supabase Documentation:
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Database Triggers](https://supabase.com/docs/guides/database/postgres/triggers)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Paystack Documentation:
- [Payment Links](https://paystack.com/docs/payments/payment-links)
- [Webhooks](https://paystack.com/docs/payments/webhooks)

---

## ✅ FINAL CHECKLIST

Before going live, ensure:
- [ ] All Meta credentials added
- [ ] All environment variables set
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Webhook verified
- [ ] Test messages working
- [ ] Payment flow tested
- [ ] Booking system tested
- [ ] Error monitoring set up
- [ ] Backup plan ready

---

## 🎉 GO LIVE!

Once all checkboxes are complete:
1. Announce to your customers
2. Share your WhatsApp Business number
3. Monitor the first few interactions
4. Celebrate! 🎊

---

**Your FlowServe AI system is ready to transform your business!**

**Need Help?** Check the documentation files:
- `DASHBOARD_AUDIT_COMPLETE.md` - Full audit report
- `PRODUCTION_READINESS_REPORT.md` - Production status
- `CALENDAR_BOOKING_GUIDE.md` - Booking system guide
- `IMPLEMENTATION_CHECKLIST.md` - Implementation details

---

**Setup Guide Created By:** Kiro AI  
**Date:** December 4, 2025  
**Status:** Ready for Meta Integration
