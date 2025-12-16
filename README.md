# CampusConnect - College Dating App

A dating website specifically designed for college students, where students are grouped into clusters of 3 colleges for matching.

## Features

- **College Clusters**: Students from 3 colleges are grouped together
- **Smart Matching**: Match with students from your college cluster
- **Secure Authentication**: College email verification
- **Modern UI**: Beautiful landing page and user interface

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT tokens

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas account)

**⚠️ Important:** MongoDB must be running before you can register users or use database features.

### Installation

1. Install dependencies:
```bash
npm install
```

2. Check MongoDB connection:
```bash
npm run check:mongodb
```

If MongoDB is not running, you have two options:

**Option A: Install and run MongoDB locally**
- Windows: Download from https://www.mongodb.com/try/download/community
- Mac: `brew install mongodb-community` then `brew services start mongodb-community`
- Linux: `sudo apt-get install mongodb` then `sudo systemctl start mongod`

**Option B: Use MongoDB Atlas (Free cloud database - Recommended)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Create `.env` file and add: `MONGODB_URI=your-connection-string-here`

3. Set up environment variables (if not using default):
```bash
# Create .env file with:
MONGODB_URI=mongodb://localhost:27017/campusconnect  # or your Atlas URI
JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
```

4. Seed the database with sample colleges:
```bash
node server/seed.js
```

4. Start the development servers:

Terminal 1 - Next.js frontend:
```bash
npm run dev
```

Terminal 2 - Node.js backend:
```bash
npm run dev:server
```

5. Open your browser:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── server/                # Node.js backend
│   ├── index.js          # Express server
│   ├── models/           # MongoDB models
│   │   ├── User.js
│   │   ├── College.js
│   │   └── Cluster.js
│   ├── routes/           # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── matches.js
│   │   └── colleges.js
│   ├── middleware/       # Middleware
│   │   └── auth.js
│   └── seed.js           # Database seeder
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Users
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)
- `GET /api/users/potential-matches` - Get potential matches (requires auth)

### Matches
- `POST /api/matches/like/:userId` - Like a user (requires auth)
- `POST /api/matches/pass/:userId` - Pass on a user (requires auth)
- `GET /api/matches` - Get all matches (requires auth)

### Colleges
- `GET /api/colleges` - Get all colleges
- `GET /api/colleges/clusters` - Get all clusters

## How It Works

1. **Registration**: Users sign up with their college email. The system automatically assigns them to a cluster based on their college.

2. **Clusters**: Colleges are grouped into clusters of 3. Students can only match with others from their cluster.

3. **Matching**: Users can browse potential matches from their cluster and like/pass on profiles. Mutual likes create a match.

4. **Connections**: Matched users can start conversations and connect.

## Development

- Frontend runs on port 3000
- Backend runs on port 5000
- Make sure MongoDB is running before starting the backend

## License

MIT

