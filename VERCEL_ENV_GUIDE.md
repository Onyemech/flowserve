# Vercel Environment Variables Guide

These are the environment variables you **MUST** add to your Vercel project settings for the frontend to work correctly.

## 1. Supabase (Database & Auth)
| Variable Name | Value (Example/Description) | Exposed to Browser? |
|--------------|-----------------------------|---------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lzofgtjotkmrravxhwfk.supabase.co` | ✅ YES |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1Ni...` (Your Anon Key) | ✅ YES |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1Ni...` (Your Service Role Key) | ❌ NO (Secret) |

## 2. Paystack (Payments)
| Variable Name | Value (Example/Description) | Exposed to Browser? |
|--------------|-----------------------------|---------------------|
| `PAYSTACK_SECRET_KEY` | `sk_test_...` | ❌ NO (Secret) |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_test_...` | ✅ YES |

## 3. Cloudinary (Image Uploads)
| Variable Name | Value (Example/Description) | Exposed to Browser? |
|--------------|-----------------------------|---------------------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `flowservecloud` | ✅ YES |
| `CLOUDINARY_API_KEY` | `853347243522818` | ❌ NO (Secret) |
| `CLOUDINARY_API_SECRET` | `JYPQTtJ...` | ❌ NO (Secret) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `flowserve_unsigned` (Create this in Cloudinary Settings > Upload) | ✅ YES |

## 4. Email (SMTP - Gmail)
| Variable Name | Value (Example/Description) | Exposed to Browser? |
|--------------|-----------------------------|---------------------|
| `SMTP_HOST` | `smtp.gmail.com` | ❌ NO |
| `SMTP_PORT` | `587` | ❌ NO |
| `SMTP_SECURE` | `false` | ❌ NO |
| `SMTP_USER` | `onyemechicaleb4@gmail.com` | ❌ NO |
| `SMTP_PASSWORD` | `vapmmsbaootvgtau` (App Password) | ❌ NO |
| `SMTP_FROM_NAME` | `FlowServe AI` | ❌ NO |
| `SMTP_FROM_EMAIL` | `onyemechicaleb4@gmail.com` | ❌ NO |

## 5. App & WhatsApp Integration
| Variable Name | Value (Example/Description) | Exposed to Browser? |
|--------------|-----------------------------|---------------------|
| `NEXT_PUBLIC_APP_URL` | `https://flowserve.vercel.app` | ✅ YES |
| `NEXT_PUBLIC_PLATFORM_WHATSAPP_NUMBER` | `15550239843` (Your Platform Phone Number) | ✅ YES |

## 6. Meta (Optional - Only if using Facebook Login/Callback)
| Variable Name | Value (Example/Description) | Exposed to Browser? |
|--------------|-----------------------------|---------------------|
| `META_APP_ID` | (From Meta App Dashboard) | ❌ NO |
| `META_APP_SECRET` | (From Meta App Dashboard) | ❌ NO |

---

### 🚀 How to Deploy on Vercel:
1. Go to your Vercel Dashboard.
2. Select your project (`flowserve`).
3. Go to **Settings** > **Environment Variables**.
4. Copy and paste the variables above.
   * **Tip:** You can copy the content of your local `.env.local` file and paste it into Vercel's "Import .env" feature to add them all at once!
