# PWA Caching & Update Strategy

## 🎯 How It Works

### When You Push to GitHub (Deploy to Vercel)

1. **Build happens** → New version deployed
2. **User opens app** → Service worker checks for updates
3. **New version found** → Downloads in background
4. **Update ready** → Blue toast appears: "Update Available"
5. **User clicks "Update Now"** → App reloads with new version
6. **User dismisses** → Update waits, will prompt again on next visit

### Caching Strategy

#### ✅ What Gets Cached
- **Static assets**: Icons, manifest, offline page
- **Images**: SVG, PNG, JPG, WebP
- **Network-first**: Always tries network, falls back to cache

#### ❌ What NEVER Gets Cached
- **API requests** (`/api/*`) - Always fresh from server
- **HTML pages** - Always fresh (except offline fallback)
- **User data** - Never cached for security
- **Authentication** - Always from server

### Update Flow

```
Deploy → User Opens App → SW Checks → New Version? → Download → Prompt User
                                           ↓
                                          No → Continue
```

## 🔧 How to Force Update

### Option 1: Increment Version (Recommended)
Edit `frontend/public/sw.js`:
```javascript
const CACHE_VERSION = '3.0.1' // Change this number
```

### Option 2: Clear Cache Manually
Users can:
1. Go to browser settings
2. Clear site data for your domain
3. Reload app

## 🛡️ Security

### What's Safe to Cache
- ✅ Public images
- ✅ Icons and logos
- ✅ Manifest file
- ✅ Offline page

### What's NEVER Cached
- ❌ User credentials
- ❌ API responses
- ❌ Personal data
- ❌ Payment information
- ❌ Session tokens

## 📱 Update Behavior

### Automatic Checks
- **On app open**: Checks immediately
- **Every 60 seconds**: While app is open
- **On navigation**: Between pages

### User Control
- **Dismissable**: User can ignore update
- **Non-intrusive**: Doesn't block app usage
- **Clear action**: "Update Now" button
- **Smooth transition**: Reloads automatically after update

## 🐛 Troubleshooting

### "App won't update"
1. Check `CACHE_VERSION` was incremented
2. Verify deployment succeeded
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
4. Unregister SW in DevTools → Application → Service Workers

### "Old content showing"
- This is expected! Network-first means:
  - If network fails → Shows cached version
  - If network succeeds → Shows fresh version
  - This prevents app from breaking offline

### "Update prompt not showing"
- Check browser console for errors
- Verify service worker is registered
- Check if update actually deployed
- Try opening in incognito mode

## 📊 Cache Lifecycle

```
Install → Activate → Fetch → Update → Install (new version)
   ↓         ↓         ↓         ↓
 Cache    Cleanup   Serve    Prompt
 Assets   Old       Content  User
```

## 🚀 Best Practices

1. **Increment version** on every deploy
2. **Test updates** in staging first
3. **Monitor logs** in production
4. **Clear old caches** automatically (done)
5. **Network-first** for dynamic content (done)
6. **Cache-first** for static assets (done)

## 🔄 Update Frequency

- **Checks**: Every 60 seconds while app open
- **Prompts**: Once per new version
- **Downloads**: Automatic in background
- **Activation**: User-controlled (click "Update Now")

This ensures users always have the latest version without disrupting their experience!
