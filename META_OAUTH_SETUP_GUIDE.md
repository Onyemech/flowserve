# Meta OAuth Setup Guide - Complete Configuration

## 📋 Prerequisites
- Meta App ID: `1572646177519931`
- App URL: `https://flowserve.vercel.app`
- Meta App Secret: `0b08b5bf4c69ce5e6adaf9c8988a73d6`

---

## 🔧 Step-by-Step Configuration

### Step 1: Configure Basic Settings

**Go to**: https://developers.facebook.com/apps/1572646177519931/settings/basic/

#### 1.1 App Domains
Scroll to **"App Domains"** section and add:
```
flowserve.vercel.app
```
Click **"Add Domain"** then **"Save Changes"**

#### 1.2 Add Website Platform
Scroll down to **"Add Platform"** button → Click it → Select **"Website"**

Add these URLs:
- **Site URL**: `https://flowserve.vercel.app`
- **Mobile Site URL**: `https://flowserve.vercel.app`

Click **"Save Changes"**

#### 1.3 Privacy Policy URL (Required for Live Mode)
Add your privacy policy URL:
```
https://flowserve.vercel.app/privacy
```

#### 1.4 Terms of Service URL (Optional but Recommended)
```
https://flowserve.vercel.app/terms
```

#### 1.5 App Icon (Required for Live Mode)
Upload a 1024x1024 PNG icon of your app logo

Click **"Save Changes"** at the bottom

---

### Step 2: Add Facebook Login Product

**Go to**: https://developers.facebook.com/apps/1572646177519931/dashboard/

#### 2.1 Add Product
- Look for **"Facebook Login"** in the products list
- Click **"Set Up"** button next to it
- Select **"Web"** as the platform

#### 2.2 Configure OAuth Settings
**Go to**: https://developers.facebook.com/apps/1572646177519931/fb-login/settings/

Add these settings:

**Valid OAuth Redirect URIs**:
```
https://flowserve.vercel.app/dashboard/whatsapp-connect
```

**Allowed Domains for the JavaScript SDK**:
```
flowserve.vercel.app
```

**Login from Devices**:
- ✅ Enable "Login from Devices"

**Use Strict Mode for Redirect URIs**:
- ✅ Enable this

Click **"Save Changes"**

---

### Step 3: Configure WhatsApp Business Product

**Go to**: https://developers.facebook.com/apps/1572646177519931/whatsapp-business/wa-settings/

#### 3.1 Add WhatsApp Product (if not added)
If WhatsApp is not in your products:
- Go to Dashboard
- Click **"Add Product"**
- Find **"WhatsApp"**
- Click **"Set Up"**

#### 3.2 Configure Webhook
In WhatsApp Settings:

**Callback URL**:
```
https://lzofgtjotkmrravxhwfk.supabase.co/functions/v1/whatsapp-webhook
```

**Verify Token**:
```
flowserve_webhook_verify_2025
```

Click **"Verify and Save"**

#### 3.3 Subscribe to Webhook Fields
Make sure these are checked:
- ✅ `messages`
- ✅ `message_status`

Click **"Save"**

---

### Step 4: Configure App Permissions

**Go to**: https://developers.facebook.com/apps/1572646177519931/app-review/permissions/

#### 4.1 Request Permissions (if needed)
Make sure these permissions are approved or in review:
- ✅ `whatsapp_business_management`
- ✅ `whatsapp_business_messaging`
- ✅ `email` (for user email)
- ✅ `public_profile` (for user name)

**Note**: For testing, these work in Development mode. For production, you need App Review.

---

### Step 5: Add Test Users (For Development Mode)

**Go to**: https://developers.facebook.com/apps/1572646177519931/roles/test-users/

#### 5.1 Add Yourself as Test User
- Click **"Add Test Users"**
- Or add your Facebook account under **"Roles"** → **"Administrators"**

This allows you to test the OAuth flow while app is in Development mode.

---

### Step 6: Switch to Live Mode (When Ready)

**Go to**: https://developers.facebook.com/apps/1572646177519931/settings/basic/

#### 6.1 Requirements for Live Mode
Before switching to Live, ensure:
- ✅ Privacy Policy URL added
- ✅ App Icon uploaded (1024x1024)
- ✅ App Category selected
- ✅ Business verification completed (if required)

#### 6.2 Switch Mode
At the top of the page, you'll see **"App Mode: Development"**

Toggle the switch to **"Live"**

**Warning**: Only do this when you've completed all requirements and tested thoroughly!

---

## ✅ Verification Checklist

Before testing, verify all these are configured:

### Basic Settings
- [ ] App Domain: `flowserve.vercel.app` added
- [ ] Website Platform added with correct URLs
- [ ] Privacy Policy URL added
- [ ] App Icon uploaded

### Facebook Login
- [ ] Facebook Login product added
- [ ] OAuth Redirect URI: `https://flowserve.vercel.app/dashboard/whatsapp-connect`
- [ ] Allowed Domain: `flowserve.vercel.app`

### WhatsApp Business
- [ ] WhatsApp product added
- [ ] Webhook URL configured
- [ ] Webhook subscribed to `messages` and `message_status`
- [ ] Verify token matches: `flowserve_webhook_verify_2025`

### Permissions
- [ ] `whatsapp_business_management` permission
- [ ] `whatsapp_business_messaging` permission
- [ ] Test user added (for Development mode)

### Environment Variables
- [ ] `NEXT_PUBLIC_META_APP_ID=1572646177519931` in frontend/.env
- [ ] `META_APP_SECRET=0b08b5bf4c69ce5e6adaf9c8988a73d6` in frontend/.env
- [ ] `META_APP_SECRET=0b08b5bf4c69ce5e6adaf9c8988a73d6` in backend/.env
- [ ] Meta secret set in Supabase: `supabase secrets set META_APP_SECRET=0b08b5bf4c69ce5e6adaf9c8988a73d6`

---

## 🧪 Testing the OAuth Flow

### Test in Development Mode

1. **Open your app**: https://flowserve.vercel.app
2. **Register/Login** as a user
3. **Go to Dashboard** - You should see green "Connect WhatsApp" banner
4. **Click "Connect Now"**
5. **You should see Facebook Login** (not an error)
6. **Log in with your Facebook account** (must be added as test user/admin)
7. **Grant permissions** when prompted
8. **Select WhatsApp Business Account**
9. **System should redirect back** with success message

### Expected Flow
```
Dashboard → Click "Connect Now" → Facebook Login → Grant Permissions → 
Select WhatsApp → Redirect Back → Success Message → WhatsApp Connected
```

### If You See "Feature unavailable" Error
This means:
- ❌ App is in Development mode AND you're not added as test user/admin
- ❌ OAuth redirect URI not configured correctly
- ❌ App domain not added

**Solution**: Add yourself as Administrator or Test User in the app roles.

---

## 🚨 Common Issues & Solutions

### Issue 1: "Feature unavailable: Facebook Login is currently unavailable"
**Cause**: App in Development mode, user not authorized

**Solution**:
1. Go to: https://developers.facebook.com/apps/1572646177519931/roles/roles/
2. Add your Facebook account as **Administrator** or **Developer**
3. Or add as Test User in Test Users section

### Issue 2: "Invalid OAuth Redirect URI"
**Cause**: Redirect URI not whitelisted

**Solution**:
1. Go to Facebook Login Settings
2. Add exact URL: `https://flowserve.vercel.app/dashboard/whatsapp-connect`
3. Make sure there's no trailing slash
4. Save changes

### Issue 3: "App Not Set Up"
**Cause**: Facebook Login product not added

**Solution**:
1. Go to App Dashboard
2. Click "Add Product"
3. Add "Facebook Login"
4. Configure OAuth settings

### Issue 4: Can't Switch to Live Mode
**Cause**: Missing required information

**Solution**:
1. Add Privacy Policy URL
2. Upload App Icon (1024x1024)
3. Complete Business Verification (if required)
4. Select App Category

---

## 📞 Support

If you encounter issues:

1. **Check Meta App Dashboard**: https://developers.facebook.com/apps/1572646177519931/dashboard/
2. **Check Browser Console**: Look for error messages
3. **Check Supabase Logs**: 
   ```bash
   supabase functions logs whatsapp-agent
   ```
4. **Verify Environment Variables**: Make sure all secrets are set correctly

---

## 🎯 Final Checklist Before Going Live

- [ ] All OAuth settings configured
- [ ] Tested with multiple test users
- [ ] Privacy Policy page created and linked
- [ ] Terms of Service page created (optional)
- [ ] App icon uploaded
- [ ] Business verification completed (if required)
- [ ] Webhook tested and working
- [ ] All environment variables set in production
- [ ] App switched to Live mode
- [ ] Tested OAuth flow in production

---

## 📝 Notes

- **Development Mode**: Only admins, developers, and test users can use OAuth
- **Live Mode**: Anyone can use OAuth (after App Review if needed)
- **Webhook**: Must be HTTPS and publicly accessible
- **Secrets**: Never commit secrets to Git
- **Testing**: Always test in Development mode first

---

## ✅ You're Done!

Once all steps are completed, admins can:
1. Register on your platform
2. Click "Connect WhatsApp" on dashboard
3. Log in with Facebook
4. Select their WhatsApp Business
5. Start using AI agent immediately

No manual Meta console setup needed for each admin!
