# 🐛 Captain Home Screen Debug Guide

## Problem
The captain home screen at `localhost:5173/captain/home` is not showing anything (blank screen).

## Root Cause Analysis

The issue is likely in the **CaptainProtectedWrapper** component which:
1. Checks for authentication token
2. Makes API call to `/captain/profile` 
3. Sets captain data in context
4. Only renders children if successful

## Debugging Steps

### 1. Check Browser Console
Open browser DevTools (F12) and check for:
- JavaScript errors
- Network request failures
- Console log messages

### 2. Test API Manually
Open `Frontend/debug/testCaptainAPI.html` in browser to test:
- Server connection
- Captain profile API
- Local storage data

### 3. Check Authentication Flow

#### Step 1: Verify Token Exists
```javascript
// In browser console:
console.log('Token:', localStorage.getItem('token'));
console.log('UserData:', localStorage.getItem('userData'));
```

#### Step 2: Test Captain Profile API
```javascript
// In browser console:
const token = localStorage.getItem('token');
fetch('http://localhost:4000/captain/profile', {
  headers: { token }
}).then(r => r.json()).then(console.log);
```

### 4. Common Issues & Solutions

#### Issue 1: No Token
**Symptoms:** Redirected to login page
**Solution:** Login as captain first at `/captain/login`

#### Issue 2: Invalid Token
**Symptoms:** 401 Unauthorized error
**Solution:** 
```javascript
localStorage.removeItem('token');
localStorage.removeItem('userData');
// Then login again
```

#### Issue 3: Server Not Running
**Symptoms:** Network connection error
**Solution:** Start backend server:
```bash
cd Backend
npm run dev
```

#### Issue 4: Wrong Server URL
**Symptoms:** 404 or connection refused
**Solution:** Check `Frontend/.env`:
```
VITE_SERVER_URL=http://localhost:4000
```

#### Issue 5: Captain Profile API Missing
**Symptoms:** 404 on `/captain/profile`
**Solution:** Verify backend has the endpoint in `Backend/routes/captain.routes.js`

### 5. Debug Components Added

#### Enhanced CaptainProtectedWrapper
Added console logging to track:
- Token validation
- API requests
- Response handling
- Error details

#### Debug Components Created
- `Frontend/debug/testCaptainAPI.html` - Manual API testing
- `Frontend/debug/testCaptainHome.jsx` - Component testing
- `Frontend/debug/captainHomeDebug.jsx` - Debug overlay

### 6. Expected Flow

1. **User visits `/captain/home`**
2. **CaptainProtectedWrapper checks token**
3. **Makes API call to `/captain/profile`**
4. **Sets captain data in context**
5. **CaptainHomeScreen renders with captain data**

### 7. Debugging Checklist

- [ ] Backend server running on port 4000
- [ ] Frontend running on port 5173
- [ ] Captain logged in with valid token
- [ ] `/captain/profile` API endpoint working
- [ ] No JavaScript errors in console
- [ ] Captain data loaded in context
- [ ] CaptainHomeScreen component rendering

### 8. Quick Fix Commands

```bash
# 1. Restart backend
cd Backend
npm run dev

# 2. Restart frontend  
cd Frontend
npm run dev

# 3. Clear browser data
# In browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 9. Test URLs

- **Captain Login:** `http://localhost:5173/captain/login`
- **Captain Home:** `http://localhost:5173/captain/home`
- **API Test:** `http://localhost:5173/debug/testCaptainAPI.html`
- **Backend Health:** `http://localhost:4000/health` (if exists)

### 10. Next Steps

1. **Open browser console** and check for errors
2. **Use the API test tool** to verify backend connectivity
3. **Check authentication flow** step by step
4. **Review console logs** from CaptainProtectedWrapper
5. **Verify captain data** is loaded correctly

## Status: 🔍 DEBUGGING

The debugging tools and enhanced logging have been added. Follow the steps above to identify and resolve the issue.

## Files Modified for Debugging

- ✅ `Frontend/src/screens/CaptainProtectedWrapper.jsx` - Added logging
- ✅ `Frontend/src/screens/CaptainHomeScreen.jsx` - Added early returns and logging
- ✅ `Frontend/debug/testCaptainAPI.html` - API testing tool
- ✅ `Frontend/debug/testCaptainHome.jsx` - Component testing
- ✅ `CAPTAIN_HOME_DEBUG.md` - This debug guide