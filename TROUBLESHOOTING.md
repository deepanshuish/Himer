# Troubleshooting Guide

## Registration Failed

If you're getting a "Registration failed" error, check the following:

### 1. Make sure MongoDB is running

**Windows:**
```bash
# Check if MongoDB is running
# If not, start MongoDB service
net start MongoDB
```

**Mac/Linux:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod
# Or start it
sudo systemctl start mongod
```

**Or use MongoDB Atlas (cloud):**
- Create a free account at https://www.mongodb.com/cloud/atlas
- Get your connection string
- Update `.env` file with your MongoDB URI

### 2. Seed the database with colleges

Before registering, you MUST seed the database:

```bash
npm run seed
```

This will create sample colleges. You can register with emails like:
- `student@stateuniv.edu`
- `student@citycollege.edu`
- `student@techinst.edu`
- `student@libarts.edu`
- `student@business.edu`
- `student@artsacademy.edu`
- `student@meduniv.edu`
- `student@engcollege.edu`
- `student@lawschool.edu`

### 3. Make sure the backend server is running

In a separate terminal, start the backend:

```bash
npm run dev:server
```

You should see:
```
Connected to MongoDB
Server running on port 5000
```

### 4. Check the error message

The signup page now shows more specific error messages:
- **"Cannot connect to server"** → Backend server is not running
- **"College not found"** → Database not seeded OR wrong email domain
- **"User already exists"** → Email already registered

### 5. Check browser console

Open browser DevTools (F12) and check the Console tab for detailed error messages.

### Quick Setup Checklist

- [ ] MongoDB is installed and running
- [ ] Database is seeded (`npm run seed`)
- [ ] Backend server is running (`npm run dev:server`)
- [ ] Frontend is running (`npm run dev`)
- [ ] Using a valid college email domain (from seed file)

