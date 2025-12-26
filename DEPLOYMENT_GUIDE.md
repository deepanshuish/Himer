# 🚀 Deployment Guide - CampusConnect

This guide will help you deploy your dating app to the internet using:
- **Frontend (Next.js)**: Vercel (recommended) or Netlify
- **Backend (Node.js/Express)**: Railway or Render
- **Database (MongoDB)**: MongoDB Atlas (free tier available)

---

## 📋 Prerequisites

1. GitHub account (you already have this ✅)
2. MongoDB Atlas account (free)
3. Vercel account (free)
4. Railway or Render account (free tier available)

---

## Step 1: Set Up MongoDB Atlas (Cloud Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" and sign up
3. Choose the **FREE** tier (M0 Sandbox)

### 1.2 Create a Cluster
1. Choose a cloud provider (AWS recommended)
2. Select a region closest to you
3. Name your cluster (e.g., "CampusConnect")
4. Click "Create Cluster" (takes 3-5 minutes)

### 1.3 Configure Database Access
1. Go to **Database Access** → **Add New Database User**
2. Username: `campusconnect` (or your choice)
3. Password: Generate a secure password (save it!)
4. Database User Privileges: **Read and write to any database**
5. Click "Add User"

### 1.4 Configure Network Access
1. Go to **Network Access** → **Add IP Address**
2. Click **"Allow Access from Anywhere"** (for now)
   - Or add specific IPs: `0.0.0.0/0`
3. Click "Confirm"

### 1.5 Get Connection String
1. Go to **Database** → Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your database user credentials
5. Add database name at the end: `...mongodb.net/campusconnect?retryWrites=true&w=majority`
6. **Save this connection string!** You'll need it for backend deployment

---

## Step 2: Deploy Backend to Railway (Recommended)

### 2.1 Create Railway Account
1. Go to [https://railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"

### 2.2 Deploy from GitHub
1. Select **"Deploy from GitHub repo"**
2. Choose your repository: `deepanshuish/Himer`
3. Railway will detect it's a Node.js project

### 2.3 Configure Backend
1. Railway will create a service automatically
2. Go to **Settings** → **Root Directory**: Set to `server` (if needed)
3. Go to **Settings** → **Start Command**: `node index.js`
4. Go to **Variables** tab and add:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/campusconnect?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
PORT=5000
NODE_ENV=production
```

**Important**: Replace the MongoDB URI with your actual connection string from Step 1.5

### 2.4 Generate Domain
1. Go to **Settings** → **Generate Domain**
2. Railway will give you a URL like: `https://your-app-name.up.railway.app`
3. **Copy this URL!** You'll need it for the frontend

### 2.5 Deploy
1. Railway will automatically deploy when you push to GitHub
2. Check **Deployments** tab to see build progress
3. Once deployed, test: `https://your-app-name.up.railway.app/api/health`
   - Should return: `{"status":"ok","message":"Server is running"}`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"

### 3.2 Import Repository
1. Select your repository: `deepanshuish/Himer`
2. Vercel will auto-detect Next.js

### 3.3 Configure Environment Variables
1. Go to **Environment Variables**
2. Add:

```
NEXT_PUBLIC_API_URL=https://your-app-name.up.railway.app
```

**Important**: Replace with your Railway backend URL from Step 2.4

### 3.4 Deploy
1. Click **"Deploy"**
2. Vercel will build and deploy automatically
3. You'll get a URL like: `https://himer.vercel.app`
4. **Your app is now live!** 🎉

---

## Step 4: Update Frontend Code (If Needed)

If your frontend code uses `http://localhost:5000`, we need to make sure it uses the environment variable.

Check that all API calls use:
```javascript
process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
```

This should already be in your code! ✅

---

## Step 5: Test Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend Health**: Visit `https://your-backend-url.railway.app/api/health`
3. **Test Signup**: Create a test account
4. **Test Login**: Login with test account
5. **Check Database**: Verify data appears in MongoDB Atlas

---

## 🔧 Alternative: Deploy Backend to Render

If Railway doesn't work, use Render:

### Render Setup:
1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New"** → **"Web Service"**
4. Connect your GitHub repo
5. Configure:
   - **Name**: `campusconnect-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
6. Add environment variables (same as Railway)
7. Click **"Create Web Service"**
8. Render will give you a URL like: `https://campusconnect-backend.onrender.com`

---

## 🐛 Troubleshooting

### Backend Issues:
- **Connection Error**: Check MongoDB Atlas network access (Step 1.4)
- **500 Errors**: Check Railway/Render logs for errors
- **CORS Errors**: Make sure backend allows your frontend domain

### Frontend Issues:
- **API Not Found**: Check `NEXT_PUBLIC_API_URL` environment variable
- **Build Errors**: Check Vercel build logs

### Database Issues:
- **Connection Failed**: Verify MongoDB URI is correct
- **Authentication Error**: Check username/password in connection string

---

## 📝 Environment Variables Summary

### Backend (Railway/Render):
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/campusconnect?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-here
PORT=5000
NODE_ENV=production
```

### Frontend (Vercel):
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

---

## 🎯 Quick Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string saved
- [ ] Backend deployed to Railway/Render
- [ ] Backend environment variables set
- [ ] Backend URL obtained
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variable set
- [ ] App tested and working

---

## 🚀 Your App URLs

After deployment, you'll have:
- **Frontend**: `https://himer.vercel.app` (or similar)
- **Backend**: `https://your-app.up.railway.app` (or similar)
- **Database**: MongoDB Atlas (cloud)

---

## 💡 Pro Tips

1. **Custom Domain**: You can add a custom domain in Vercel settings
2. **Auto-Deploy**: Both Vercel and Railway auto-deploy on git push
3. **Monitoring**: Check logs in Railway/Vercel dashboards
4. **Database Backup**: MongoDB Atlas has automatic backups
5. **SSL/HTTPS**: Both platforms provide free SSL certificates

---

## 🆘 Need Help?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

Good luck with your deployment! 🎉
