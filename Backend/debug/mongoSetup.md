# MongoDB Atlas Setup Instructions

## 🔧 Current Issue
Your connection string is missing the password:
```
MONGODB_URL=mongodb+srv://dinidu:yourpassword@cluster0.772hjqu.mongodb.net/quickRide?retryWrites=true&w=majority&appName=Cluster0
```

## ✅ How to Fix

### Step 1: Get Your Password
1. Login to MongoDB Atlas: https://cloud.mongodb.com/
2. Go to "Database Access" in the left menu
3. Find your user "dinidu"
4. If you forgot the password, click "Edit" and set a new password

### Step 2: Update .env File
Replace `yourpassword` with your actual password in Backend/.env:
```env
MONGODB_URL=mongodb+srv://dinidu:ACTUAL_PASSWORD@cluster0.772hjqu.mongodb.net/quickRide?retryWrites=true&w=majority&appName=Cluster0
```

### Step 3: Test Connection
```bash
node debug/testAtlas.js
```

## 🎯 Expected Success Output
```
✅ Atlas connection successful!
📊 Found X collections
✅ Test completed successfully
```

## 🚨 If Still Failing
1. **Check Network Access**: In Atlas, go to "Network Access" and add your IP (or use 0.0.0.0/0 for testing)
2. **Verify Cluster**: Make sure your cluster is running (not paused)
3. **Try Different Region**: Create a new cluster in a different region if needed

## 📝 Alternative: Get Fresh Connection String
1. In Atlas, go to your cluster
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Update MONGODB_URL in .env