# Profile Picture Upload - Complete Fix

## 🚨 Issues Identified

### 1. **Frontend Issues**
- Profile picture preview not showing correctly
- Upload functionality not working properly
- Error handling insufficient
- UI/UX not intuitive

### 2. **Backend Issues**
- File serving might not be configured properly
- Upload directory permissions
- Error responses not user-friendly

### 3. **Integration Issues**
- Profile picture not updating across components
- Context not syncing properly
- localStorage not updating

## ✅ Complete Solution

### 1. Enhanced Frontend Implementation

**File**: `Frontend/src/screens/UserEditProfile.jsx`

**Key Improvements:**
- Better file handling and preview
- Immediate upload with visual feedback
- Proper error handling
- Context synchronization

### 2. Backend Verification

**File**: `Backend/middleware/upload.js`
- Multer configuration verified
- File validation working
- Directory creation automatic

**File**: `Backend/controllers/user.controller.js`
- Upload endpoints implemented
- Database updates working
- Response format correct

### 3. Static File Serving

**File**: `Backend/server.js`
```javascript
// Ensure this line exists
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

## 🔧 Implementation Steps

### Step 1: Verify Backend Setup

1. **Check if multer is installed:**
```bash
cd Backend
npm list multer
```

2. **If not installed, run:**
```bash
npm install multer
```

3. **Verify upload directories exist:**
```bash
ls -la Backend/uploads/profile-pictures/
```

### Step 2: Test Upload Endpoint

Create a test script to verify the upload endpoint:

**File**: `Backend/debug/testProfileUpload.js`
```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testProfileUpload() {
  try {
    const formData = new FormData();
    // Create a test image file or use existing one
    formData.append('profilePicture', fs.createReadStream('test-image.jpg'));
    
    const response = await axios.post('http://localhost:4000/user/upload-profile-picture', formData, {
      headers: {
        ...formData.getHeaders(),
        'token': 'YOUR_TEST_TOKEN_HERE'
      }
    });
    
    console.log('Upload successful:', response.data);
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
  }
}

testProfileUpload();
```

### Step 3: Enhanced Frontend Component

**Updated Profile Picture Section:**
```jsx
{/* Profile Picture Section */}
<Card className="p-6">
  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
    <div className="flex-shrink-0">
      <div className="relative">
        {profilePicture ? (
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
              <img 
                src={getProfilePictureUrl(profilePicture)} 
                alt="Profile preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image load error:', e);
                  setProfilePicture(null);
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => removeProfilePicture()}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div 
            className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
            onClick={() => document.getElementById('profile-upload')?.click()}
          >
            <User className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          onChange={handleProfilePictureChange}
          className="hidden"
        />
      </div>
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Picture</h3>
      <p className="text-sm text-gray-600 mb-4">
        Upload a profile picture to personalize your account. Maximum size: 5MB.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => document.getElementById('profile-upload')?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : profilePicture ? 'Change Photo' : 'Upload Photo'}
        </Button>
        {profilePicture && !uploading && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={removeProfilePicture}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  </div>
</Card>
```

### Step 4: Enhanced JavaScript Functions

```jsx
const [uploading, setUploading] = useState(false);

// Helper function to get correct profile picture URL
const getProfilePictureUrl = (picture) => {
  if (!picture) return null;
  
  // If it's a File object, create object URL
  if (picture instanceof File) {
    return URL.createObjectURL(picture);
  }
  
  // If it's already a full URL, return as is
  if (typeof picture === 'string' && picture.startsWith('http')) {
    return picture;
  }
  
  // If it's a relative path, prepend server URL
  if (typeof picture === 'string') {
    return `${import.meta.env.VITE_SERVER_URL}${picture}`;
  }
  
  return null;
};

// Enhanced profile picture change handler
const handleProfilePictureChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showAlert('Invalid File', 'Please select an image file', 'error');
    return;
  }
  
  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showAlert('File Too Large', 'Please select an image smaller than 5MB', 'error');
    return;
  }
  
  // Show preview immediately
  setProfilePicture(file);
  
  // Upload to server
  await uploadProfilePictureOnly(file);
};

// Enhanced upload function
const uploadProfilePictureOnly = async (file) => {
  try {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    console.log('Uploading profile picture...');
    
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/user/upload-profile-picture`,
      formData,
      {
        headers: {
          token: token,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    console.log('Profile picture upload response:', response.data);
    
    // Update user context with new profile picture
    if (response.data.user) {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData) {
        userData.data = response.data.user;
        localStorage.setItem("userData", JSON.stringify(userData));
      }
      
      // Update user context
      setUser(response.data.user);
      
      // Update local state with server URL
      setProfilePicture(response.data.profilePicture);
    }
    
    showAlert('Success', 'Profile picture updated successfully', 'success');
    
    return response.data.profilePicture;
  } catch (error) {
    console.error('Profile picture upload error:', error);
    
    // Reset to previous state on error
    if (user?.profilePicture) {
      setProfilePicture(user.profilePicture);
    } else {
      setProfilePicture(null);
    }
    
    const errorMessage = error.response?.data?.message || 'Failed to upload profile picture';
    showAlert('Upload Failed', errorMessage, 'error');
    
    return null;
  } finally {
    setUploading(false);
  }
};

// Remove profile picture function
const removeProfilePicture = async () => {
  try {
    setUploading(true);
    
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/user/update`,
      {
        fullname: {
          firstname: user.fullname.firstname,
          lastname: user.fullname.lastname
        },
        phone: user.phone,
        removeProfilePicture: true
      },
      {
        headers: {
          token: token,
        },
      }
    );
    
    // Update user context
    if (response.data.user) {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData) {
        userData.data = response.data.user;
        localStorage.setItem("userData", JSON.stringify(userData));
      }
      
      setUser(response.data.user);
    }
    
    setProfilePicture(null);
    showAlert('Success', 'Profile picture removed successfully', 'success');
    
  } catch (error) {
    console.error('Remove profile picture error:', error);
    showAlert('Error', 'Failed to remove profile picture', 'error');
  } finally {
    setUploading(false);
  }
};
```

### Step 5: Backend Controller Enhancement

**File**: `Backend/controllers/user.controller.js`

Add support for removing profile pictures:

```javascript
module.exports.updateUserProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { fullname, phone, removeProfilePicture } = req.body;
  
  // Prepare update data
  const updateData = {
    fullname: fullname,
    phone,
  };

  // If removing profile picture
  if (removeProfilePicture === 'true' || removeProfilePicture === true) {
    updateData.profilePicture = null;
  }
  // If a profile picture was uploaded, add it to update data
  else if (req.file) {
    updateData.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
  }

  const updatedUserData = await userModel.findOneAndUpdate(
    { _id: req.user._id },
    updateData,
    { new: true }
  );

  res
    .status(200)
    .json({ message: "Profile updated successfully", user: updatedUserData });
});
```

## 🧪 Testing Checklist

### Frontend Testing
- [ ] Click on empty circle opens file picker
- [ ] Selected image shows preview immediately
- [ ] Upload progress shows during upload
- [ ] Success message appears after upload
- [ ] Profile picture updates in UI
- [ ] Remove button works correctly
- [ ] File validation works (size, type)
- [ ] Error messages display properly

### Backend Testing
- [ ] Upload endpoint accepts files
- [ ] File validation works
- [ ] Files save to correct directory
- [ ] Database updates correctly
- [ ] Static files serve properly
- [ ] Error responses are proper

### Integration Testing
- [ ] Profile picture shows in sidebar
- [ ] Profile picture persists after refresh
- [ ] Context updates propagate
- [ ] localStorage syncs correctly

## 🚀 Quick Fix Script

Create this script to quickly test and fix common issues:

**File**: `Frontend/debug/fixProfilePicture.js`
```javascript
// Quick diagnostic and fix script
console.log('🔍 Profile Picture Diagnostic');

// Check environment variables
console.log('VITE_SERVER_URL:', import.meta.env.VITE_SERVER_URL);

// Check user context
const userData = JSON.parse(localStorage.getItem('userData') || '{}');
console.log('User data:', userData);

// Check if backend is responding
fetch(`${import.meta.env.VITE_SERVER_URL}/user/profile`, {
  headers: {
    'token': localStorage.getItem('token')
  }
})
.then(response => response.json())
.then(data => {
  console.log('✅ Backend responding:', data);
})
.catch(error => {
  console.error('❌ Backend error:', error);
});

// Test file upload endpoint
console.log('Testing upload endpoint availability...');
fetch(`${import.meta.env.VITE_SERVER_URL}/user/upload-profile-picture`, {
  method: 'OPTIONS'
})
.then(response => {
  console.log('✅ Upload endpoint available');
})
.catch(error => {
  console.error('❌ Upload endpoint not available:', error);
});
```

---

**Status**: 🔧 **READY FOR IMPLEMENTATION**

This comprehensive fix addresses all common issues with profile picture uploads and provides a robust, user-friendly implementation.