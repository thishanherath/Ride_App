# Profile Picture Testing Guide

## 🧪 Complete Testing Checklist

### Pre-Test Setup
1. **Start the backend server**
   ```bash
   cd Ride_App/Backend
   npm start
   ```

2. **Start the frontend server**
   ```bash
   cd Ride_App/Frontend
   npm run dev
   ```

3. **Open browser developer console** (F12)
4. **Login to the app** with a user account
5. **Navigate to** `/user/edit-profile`

## 📋 Test Cases

### Test 1: Basic Profile Picture Upload
**Steps:**
1. Navigate to Edit Profile page
2. Look for the profile picture section (circular placeholder or existing image)
3. Click "Upload Photo" button or click on the circular area
4. Select a JPEG image (recommended: 400x400px, under 1MB)
5. Wait for upload to complete

**Expected Results:**
- ✅ File picker opens
- ✅ Image preview appears immediately
- ✅ Upload progress indicator shows
- ✅ Success message appears
- ✅ Profile picture shows in the edit profile page

**Console Logs to Check:**
```
🔄 UserEditProfile component rendering...
📁 File selected: File {...}
📁 File type: image/jpeg
📁 File size: [number]
✅ File validation passed, showing preview
🔄 Starting profile picture upload...
📤 Sending upload request...
✅ Profile picture upload response: {...}
Fresh user profile response: {...}
Updating user context with fresh user data: {...}
```

### Test 2: Cross-Component Visibility
**After uploading a profile picture:**

1. **Check Header (Top-Right Corner)**
   - ✅ Profile picture should appear in header
   - ✅ Image should load without errors
   - ✅ Clicking should work (if functionality exists)

2. **Check Sidebar**
   - Click menu button (hamburger icon)
   - ✅ Profile picture should appear in sidebar header
   - ✅ User name should display correctly

3. **Navigate to Other Pages**
   - Go to Home page (`/home`)
   - ✅ Profile picture should persist in header
   - ✅ Profile picture should show in sidebar

**Console Logs to Check:**
```
ProfileAvatar: updateProfilePicture called with user: {...}
ProfileAvatar: User profilePicture field: /uploads/profile-pictures/...
ProfileAvatar: Found profilePicture field: /uploads/profile-pictures/...
ProfileAvatar: Constructed full URL: http://localhost:4000/uploads/profile-pictures/...
ProfileAvatar: Final URL set to: ...
ProfileAvatar: Image loaded successfully
```

### Test 3: File Format Validation
**Test different file types:**

1. **Valid Formats (Should Work):**
   - JPEG (.jpg) ✅
   - PNG (.png) ✅
   - WebP (.webp) ✅
   - GIF (.gif) ✅

2. **Invalid Formats (Should Fail):**
   - PDF file ❌
   - Word document ❌
   - Text file ❌
   - Video file ❌

**Expected Results:**
- Valid formats: Upload succeeds
- Invalid formats: Error message "Please select a valid image file (JPG, PNG, WebP, or GIF)"

### Test 4: File Size Validation
**Test file size limits:**

1. **Small file** (under 1MB) ✅ Should work
2. **Medium file** (1-5MB) ✅ Should work
3. **Large file** (over 5MB) ❌ Should fail

**Expected Results:**
- Small/Medium: Upload succeeds
- Large: Error message "Please select an image smaller than 5MB"

### Test 5: Profile Picture Removal
**Steps:**
1. Upload a profile picture (if not already done)
2. Click "Remove" button or X button on the image
3. Confirm removal

**Expected Results:**
- ✅ Profile picture disappears from edit profile page
- ✅ Profile picture disappears from header
- ✅ Profile picture disappears from sidebar
- ✅ Success message appears

### Test 6: Page Refresh Persistence
**Steps:**
1. Upload a profile picture
2. Refresh the page (F5)
3. Navigate to different pages

**Expected Results:**
- ✅ Profile picture persists after refresh
- ✅ Profile picture shows on all pages
- ✅ No console errors

### Test 7: Error Handling
**Test error scenarios:**

1. **Network Error** (disconnect internet during upload)
2. **Server Error** (stop backend server during upload)
3. **Invalid Token** (clear localStorage token)

**Expected Results:**
- ❌ Appropriate error messages appear
- ❌ No blank pages or crashes
- ❌ Graceful fallback behavior

## 🔍 Debugging Checklist

### If Upload Fails
1. **Check Console Errors**
   - Look for network errors
   - Check for JavaScript errors
   - Verify API endpoints

2. **Check Network Tab**
   - Verify POST request to `/user/upload-profile-picture`
   - Check response status (should be 200)
   - Verify file is being sent in FormData

3. **Check Backend**
   - Ensure backend server is running
   - Check backend console for errors
   - Verify upload endpoint exists

### If Profile Picture Not Visible
1. **Check Console Logs**
   - Look for ProfileAvatar component logs
   - Verify user context updates
   - Check for image loading errors

2. **Check User Context**
   - Verify `user.profilePicture` field exists
   - Check localStorage `userData`
   - Ensure UserContext is properly provided

3. **Check Image URLs**
   - Verify image URLs are correctly constructed
   - Check if images exist on server
   - Test image URLs directly in browser

## 📊 Success Criteria

### ✅ All Tests Pass If:
1. **Upload Works**: Images upload successfully
2. **Validation Works**: Invalid files are rejected
3. **Visibility Works**: Profile pictures show everywhere
4. **Persistence Works**: Images persist after refresh
5. **Removal Works**: Images can be removed
6. **Error Handling Works**: Errors are handled gracefully

### 🚨 Common Issues and Solutions

**Issue**: Blank page after upload
- **Solution**: Check console for JavaScript errors

**Issue**: Profile picture not showing in header/sidebar
- **Solution**: Verify UserContext is provided in App.jsx

**Issue**: Upload fails with 401 error
- **Solution**: Check authentication token

**Issue**: Image not loading
- **Solution**: Check image URL construction and server file paths

## 📝 Test Results Template

```
Date: [DATE]
Tester: [NAME]

✅ Basic Upload: PASS/FAIL
✅ Cross-Component Visibility: PASS/FAIL
✅ File Format Validation: PASS/FAIL
✅ File Size Validation: PASS/FAIL
✅ Profile Picture Removal: PASS/FAIL
✅ Page Refresh Persistence: PASS/FAIL
✅ Error Handling: PASS/FAIL

Notes:
- [Any issues found]
- [Performance observations]
- [Browser compatibility notes]
```

Follow this guide step by step to thoroughly test the profile picture functionality!