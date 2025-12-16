# Setting Up MongoDB Atlas (Free Cloud Database)

## Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email (it's free!)

## Step 2: Create a Free Cluster

1. After signing up, click "Build a Database"
2. Choose the **FREE** tier (M0)
3. Select a cloud provider (AWS is fine)
4. Choose a region closest to you
5. Name your cluster (e.g., "Cluster0")
6. Click "Create"

## Step 3: Create Database User

1. Go to "Database Access" in the left menu
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter a username (e.g., "admin")
5. Enter a password (save this!)
6. Set privileges to "Atlas admin"
7. Click "Add User"

## Step 4: Whitelist Your IP Address

1. Go to "Network Access" in the left menu
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - Or add your current IP: Click "Add Current IP Address"
4. Click "Confirm"

## Step 5: Get Your Connection String

1. Go to "Database" in the left menu
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your .env File

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add your connection string:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/campusconnect?retryWrites=true&w=majority
   JWT_SECRET=your-secret-key-change-this-in-production
   PORT=5000
   ```
   
   **Important:** Replace:
   - `your-username` with your database username
   - `your-password` with your database password
   - `cluster0.xxxxx` with your actual cluster address
   - Keep `/campusconnect` at the end (this is your database name)

## Step 7: Test the Connection

Run:
```bash
npm run check:mongodb
```

You should see: ✅ SUCCESS: MongoDB is connected and accessible!

## Step 8: Seed the Database

```bash
npm run seed
```

## Done! 🎉

Now you can:
- Start your backend: `npm run dev:server`
- Register with your IIT Ropar email: `2021mmb1347@iitrpr.ac.in`

