# Quick Setup: MongoDB Local Installation

## Step 1: Download MongoDB

1. **Open this link in your browser:**
   ```
   https://www.mongodb.com/try/download/community
   ```

2. **Select these options:**
   - **Version:** Latest (7.0 or newer)
   - **Platform:** Windows
   - **Package:** MSI
   - Click **"Download"**

## Step 2: Install MongoDB

1. Run the downloaded `.msi` file
2. Click **"Next"** through the setup wizard
3. **IMPORTANT:** Check ✅ **"Install MongoDB as a Service"**
4. Choose **"Run service as Network Service user"**
5. Check ✅ **"Install MongoDB Compass"** (optional - it's a GUI tool)
6. Click **"Install"** and wait for completion

## Step 3: Start MongoDB

**Option A: Using PowerShell Script (Easier)**
```powershell
# Right-click PowerShell and "Run as Administrator"
.\start-mongodb.ps1
```

**Option B: Manual Command**
```powershell
# Open PowerShell as Administrator
net start MongoDB
```

You should see: `The MongoDB service was started successfully.`

## Step 4: Verify Installation

Run this command:
```bash
npm run check:mongodb
```

You should see: ✅ **SUCCESS: MongoDB is connected and accessible!**

## Step 5: Seed the Database

```bash
npm run seed
```

This creates sample colleges including IIT Ropar.

## Step 6: Start Your Application

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Step 7: Register!

Go to http://localhost:3000/signup and register with:
- Email: `2021mmb1347@iitrpr.ac.in`
- Your name and password

## Troubleshooting

### "Service not found" Error
- MongoDB might not be installed correctly
- Re-run the installer and make sure "Install as a Service" is checked

### "Access Denied" Error
- You need to run PowerShell as Administrator
- Right-click PowerShell → "Run as Administrator"

### Port 27017 Already in Use
- Another MongoDB instance might be running
- Check: `Get-Process | Where-Object {$_.ProcessName -like "*mongo*"}`

### MongoDB Won't Start
- Check Windows Services: Press `Win + R`, type `services.msc`
- Look for "MongoDB" service
- Right-click → Start

## Need Help?

Run the helper script:
```bash
npm run mongodb:install
```

This will guide you through the installation process.

