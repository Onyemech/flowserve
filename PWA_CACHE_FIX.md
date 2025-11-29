# How to Fix PWA Not Updating on Mobile

## The Problem
The old service worker is aggressively caching content, preventing updates from showing even after refresh.

## Solution 1: Clear Site Data (Recommended)

### On Android (Chrome):
1. Open your PWA app
2. Tap the 3 dots menu (⋮) in top right
3. Tap **"Settings"**
4. Scroll down to **"Site settings"**
5. Tap **"Clear & reset"** or **"Storage"**
6. Tap **"Clear site storage"** or **"Clear data"**
7. Confirm and close the app
8. Reopen the app - it will download fresh content

### On iPhone (Safari):
1. Go to **Settings** → **Safari**
2. Scroll down to **"Advanced"**
3. Tap **"Website Data"**
4. Search for your domain (e.g., "flowserve")
5. Swipe left and tap **"Delete"**
6. Or tap **"Remove All Website Data"** (clears all sites)
7. Reopen the app

## Solution 2: Uninstall and Reinstall PWA

### Android:
1. Long press the app icon
2. Tap **"App info"** or drag to **"Uninstall"**
3. Confirm uninstall
4. Visit your website in Chrome
5. Tap **"Install"** when prompted

### iPhone:
1. Long press the app icon
2. Tap **"Remove App"**
3. Tap **"Delete App"**
4. Visit your website in Safari
5. Tap the Share button (⬆️)
6. Tap **"Add to Home Screen"**

## What Changed
The new service worker (v2) uses **Network-First** strategy:
- ✅ Always fetches latest content from network
- ✅ Only uses cache when offline
- ✅ Never caches API requests
- ✅ Only caches images and static assets

Once you clear the cache, updates will appear immediately on refresh!
