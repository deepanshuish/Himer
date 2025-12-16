# Quick Start Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start the Backend Server

Open a terminal and run:

```bash
npm run dev:server
```

**You should see:**
```
Server running on port 5000
Health check: http://localhost:5000/api/health
```

If you see MongoDB connection errors, that's OK - the server will still run. You just need to seed the database later.

## Step 3: Start the Frontend (in a NEW terminal)

Open a **second terminal** and run:

```bash
npm run dev
```

**You should see:**
```
- ready started server on 0.0.0.0:3000
```

## Step 4: Test the Connection

1. Open your browser and go to: http://localhost:3000
2. Open another tab and test the backend: http://localhost:5000/api/health
   - You should see: `{"status":"ok","message":"Server is running"}`

## Step 5: Seed the Database (Optional but Recommended)

In a third terminal:

```bash
npm run seed
```

This creates sample colleges so you can register with emails like:
- `test@stateuniv.edu`
- `test@citycollege.edu`
- etc.

## Troubleshooting

### "Cannot connect to server" Error

1. **Check if backend is running:**
   - Open http://localhost:5000/api/health in your browser
   - If it doesn't load, the backend isn't running

2. **Start the backend:**
   ```bash
   npm run dev:server
   ```

3. **Check the terminal output:**
   - Should see: `Server running on port 5000`
   - If you see errors, check the error messages

### Port Already in Use

If port 5000 is already in use:
1. Find what's using it: `netstat -ano | findstr :5000` (Windows) or `lsof -i :5000` (Mac/Linux)
2. Kill that process, or
3. Change the port in `.env` file: `PORT=5001`

### MongoDB Not Required Initially

The server will start even without MongoDB! You just need MongoDB when you want to:
- Seed the database
- Register users
- Use the app features

For now, just make sure the server starts on port 5000.

