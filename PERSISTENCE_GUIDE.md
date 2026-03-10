# Data Persistence Guide

## Current Implementation

The Booking Scheduler app uses **localStorage** to persist all data. This means:

### ✅ What IS Persisted (Same Device)
- Admin passcode (default: `hkUO@852`)
- Page title and description (editable by admin)
- All booking submissions
- Time slot availability and limits
- Date slot availability and limits
- Assigned bookings

### ✅ When Data Persists
- ✅ Browser refresh (F5)
- ✅ Closing and reopening browser tab
- ✅ Closing and reopening browser application
- ✅ Computer restart (data remains)

### ❌ Limitations
- ❌ Data does NOT sync across different devices
- ❌ Clearing browser data/cache will erase all data
- ❌ Different browsers on same device have separate storage
- ❌ Incognito/Private mode does NOT persist data

## How It Works

All data is automatically saved to browser's localStorage whenever:
- A new booking is submitted
- Admin updates the passcode
- Admin updates page title/description
- Admin adjusts slot limits
- Admin assigns bookings

The data is loaded automatically when the page opens.

## For Multi-Device Sync

To sync data across multiple devices, you would need:
1. **Backend Server** (e.g., Node.js, Python Flask/Django)
2. **Database** (e.g., Firebase, MongoDB, PostgreSQL, MySQL)
3. **API Integration** to replace localStorage calls

Popular solutions:
- **Firebase** (Google) - Free tier available, real-time sync
- **Supabase** - Open-source Firebase alternative
- **MongoDB Atlas** - Free tier cloud database
- **Custom backend** with any database

## Testing Persistence

1. Enter admin mode with passcode: `hkUO@852`
2. Go to Settings tab
3. Update the admin passcode
4. Close browser completely
5. Reopen browser and navigate to the app
6. Enter admin mode - use the NEW passcode

The new passcode should work, confirming persistence is functioning.

## Data Export/Backup

Currently, admins can:
- View all submissions in the admin panel
- Manually copy data if needed

For automatic backups across devices, a backend solution would be required.
