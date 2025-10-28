# MongoDB Atlas Setup Guide

## 🚀 Quick Fix Steps

### 1. Get Your Correct Atlas Connection String

1. **Login to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Find your cluster** (or create a new free one)
3. **Click "Connect"** button on your cluster
4. **Choose "Connect your application"**
5. **Copy the connection string** - it should look like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/quickRide?retryWrites=true&w=majority
   ```

### 2. Update Your .env File

Replace the `MONGODB_URL` in your `.env` file with the correct connection string:

```env
MONGODB_URL=mongodb+srv://thishan:123@cluster0.xxxxx.mongodb.net/quickRide?retryWrites=true&w=majority
```

**Note**: Replace `xxxxx` with your actual cluster identifier from Atlas.

### 3. Common Atlas Connection String Formats

Your connection string should have one of these formats:

**Format 1 (SRV - Recommended):**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database?retryWrites=true&w=majority
```

**Format 2 (Standard):**
```
mongodb://username:password@cluster0-shard-00-00.xxxxx.mongodb.net:27017,cluster0-shard-00-01.xxxxx.mongodb.net:27017,cluster0-shard-00-02.xxxxx.mongodb.net:27017/database?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

### 4. Verify Network Access

1. **In Atlas Dashboard**: Go to "Network Access"
2. **Add IP Address**: Add your current IP or use `0.0.0.0/0` for testing
3. **Save**: Wait for the changes to apply

### 5. Verify Database User

1. **In Atlas Dashboard**: Go to "Database Access"
2. **Check User**: Ensure your user exists and has read/write permissions
3. **Password**: Make sure the password in connection string is correct

## 🧪 Test Your Connection

After updating the connection string, test it:

```bash
node debug/testAtlas.js
```

## ✅ Expected Success Output

```
🧪 Testing MongoDB Atlas Connection...
URL: mongodb+srv://***:***@cluster0.xxxxx.mongodb.net/quickRide?retryWrites=true&w=majority
🔄 Connecting...
✅ Atlas connection successful!
📊 Found X collections
✅ Test completed successfully
```

## 🆘 Still Having Issues?

1. **Create a new free cluster** in Atlas if your current one doesn't work
2. **Use MongoDB Compass** to test the connection string first
3. **Check Atlas status page**: https://status.cloud.mongodb.com/
4. **Contact Atlas support** if the issue persists

## 🎯 Final Step

Once your connection works, restart your server:

```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB Atlas successfully
```