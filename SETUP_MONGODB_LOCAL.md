# Installing MongoDB Locally on Windows

## Option A: MongoDB Community Server (Recommended)

### Step 1: Download MongoDB

1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (7.0 or newer)
   - Platform: Windows
   - Package: MSI
3. Click "Download"

### Step 2: Install MongoDB

1. Run the downloaded `.msi` file
2. Choose "Complete" installation
3. **Important:** Check "Install MongoDB as a Service"
4. Choose "Run service as Network Service user"
5. Check "Install MongoDB Compass" (optional GUI tool)
6. Click "Install"

### Step 3: Verify Installation

Open PowerShell as Administrator and run:
```powershell
net start MongoDB
```

You should see: "The MongoDB service was started successfully."

### Step 4: Test Connection

Run:
```bash
npm run check:mongodb
```

### Step 5: Seed Database

```bash
npm run seed
```

## Option B: MongoDB via Chocolatey (If you have Chocolatey)

```powershell
choco install mongodb
```

Then start it:
```powershell
net start MongoDB
```

## Troubleshooting

### Service Not Found
If `net start MongoDB` doesn't work, the service might be named differently:
```powershell
Get-Service | Where-Object {$_.DisplayName -like "*Mongo*"}
```

### Manual Start
If MongoDB is installed but not as a service:
1. Find MongoDB installation (usually `C:\Program Files\MongoDB\Server\7.0\bin`)
2. Run: `mongod.exe --dbpath "C:\data\db"`
3. Create the folder first: `mkdir C:\data\db`

### Port Already in Use
If port 27017 is in use, you can change MongoDB port or stop the conflicting service.

