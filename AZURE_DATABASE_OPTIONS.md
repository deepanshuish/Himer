# 🗄️ Azure Database Options for CampusConnect

This guide covers all database options available on Microsoft Azure for your dating app.

---

## 📊 Azure Database Services Comparison

| Database Type | Service Name | Best For | Free Tier | Pricing |
|--------------|--------------|----------|-----------|---------|
| **NoSQL** | Azure Cosmos DB | Flexible schema, global distribution | ✅ Yes (25GB free) | Pay-as-you-go |
| **SQL** | Azure SQL Database | Structured data, ACID transactions | ✅ Yes (limited) | From $5/month |
| **PostgreSQL** | Azure Database for PostgreSQL | Open-source SQL, complex queries | ✅ Yes (limited) | From $25/month |
| **MySQL** | Azure Database for MySQL | Open-source SQL, web apps | ✅ Yes (limited) | From $25/month |
| **Redis** | Azure Cache for Redis | Caching, sessions | ❌ No | From $20/month |

---

## 🎯 Recommended: Azure Cosmos DB (MongoDB API)

**Best choice for your app** - It's MongoDB-compatible and requires minimal code changes!

### Why Cosmos DB?
- ✅ **MongoDB API compatible** - Works with your existing Mongoose code
- ✅ **Free tier**: 25GB storage + 400 RU/s throughput (free forever)
- ✅ **Global distribution** - Fast worldwide
- ✅ **Auto-scaling
- ✅ **Serverless option** - Pay only for what you use

### Setup Steps:

#### 1. Create Cosmos DB Account
1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"**
3. Search **"Azure Cosmos DB"**
4. Click **"Create"**
5. Configure:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Account Name**: `campusconnect-db` (must be globally unique)
   - **API**: Select **"Azure Cosmos DB for MongoDB"** ⚠️ Important!
   - **Location**: Choose closest to you
   - **Capacity mode**: **Provisioned throughput** (or Serverless for pay-per-use)
   - **Free Tier Discount**: ✅ **Apply** (gives you free tier)
6. Click **"Review + Create"** → **"Create"**

#### 2. Get Connection String
1. Go to your Cosmos DB account
2. Click **"Connection String"** in left menu
3. Copy the **"Primary Connection String"**
   - Looks like: `mongodb://campusconnect-db:xxxxx@campusconnect-db.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb`
4. **Save this!** You'll need it for your backend

#### 3. Update Your Code
**Good news**: Your existing Mongoose code works as-is! Just update the connection string:

```javascript
// In server/index.js
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect';

// For Cosmos DB, use the connection string from Azure Portal
// It will look like:
// mongodb://account-name:password@account-name.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@account-name@
```

**No code changes needed!** Your Mongoose models work exactly the same.

#### 4. Environment Variable
In Railway/Render, update:
```
MONGODB_URI=mongodb://your-account:your-password@your-account.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false
```

---

## 🗄️ Option 2: Azure SQL Database

**Best for**: Structured data, complex relationships, SQL queries

### Setup Steps:

#### 1. Create SQL Database
1. Azure Portal → **"Create a resource"**
2. Search **"SQL Database"**
3. Configure:
   - **Database name**: `CampusConnectDB`
   - **Server**: Create new server
   - **Pricing tier**: **Basic** ($5/month) or **Free** (limited)
   - **Compute + storage**: Basic tier
4. Click **"Create"**

#### 2. Get Connection String
1. Go to your SQL Database
2. Click **"Connection strings"**
3. Copy **ADO.NET** or **ODBC** connection string
4. Note: You'll need to update your backend code to use SQL instead of MongoDB

#### 3. Code Changes Required
You'll need to replace Mongoose with a SQL ORM like **Sequelize** or **TypeORM**:

```javascript
// Install: npm install sequelize mssql
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.AZURE_SQL_CONNECTION_STRING, {
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: true // Required for Azure SQL
    }
  }
});
```

**⚠️ Major refactoring required** - All your Mongoose models need to be converted to SQL tables.

---

## 🐘 Option 3: Azure Database for PostgreSQL

**Best for**: Open-source SQL, complex queries, JSON support

### Setup Steps:

#### 1. Create PostgreSQL Database
1. Azure Portal → **"Create a resource"**
2. Search **"Azure Database for PostgreSQL"**
3. Choose **"Flexible Server"** (recommended)
4. Configure:
   - **Server name**: `campusconnect-postgres`
   - **Region**: Closest to you
   - **PostgreSQL version**: 14 or 15
   - **Compute + storage**: **Burstable B1ms** (cheapest, ~$12/month)
   - **Storage**: 32GB (included)
5. Click **"Create"**

#### 2. Get Connection String
```
postgresql://username:password@campusconnect-postgres.postgres.database.azure.com:5432/campusconnect?sslmode=require
```

#### 3. Code Changes Required
Replace Mongoose with **pg** (PostgreSQL client) or **Sequelize**:

```javascript
// Install: npm install pg sequelize
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRES_CONNECTION_STRING, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});
```

**⚠️ Major refactoring required** - Convert all Mongoose models to Sequelize models.

---

## 🐬 Option 4: Azure Database for MySQL

**Best for**: Open-source SQL, WordPress-style apps

### Setup Steps:

#### 1. Create MySQL Database
1. Azure Portal → **"Create a resource"**
2. Search **"Azure Database for MySQL"**
3. Choose **"Flexible Server"**
4. Configure similar to PostgreSQL
5. Get connection string: `mysql://username:password@server.mysql.database.azure.com:3306/database`

#### 2. Code Changes Required
Use **mysql2** or **Sequelize**:

```javascript
// Install: npm install mysql2 sequelize
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.MYSQL_CONNECTION_STRING, {
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});
```

**⚠️ Major refactoring required** - Convert all Mongoose models.

---

## ⚡ Option 5: Azure Cache for Redis (Caching Only)

**Best for**: Caching, sessions, real-time features

**Note**: This is NOT a primary database - use it alongside another database for caching.

### Use Cases:
- Cache user sessions
- Cache frequently accessed data
- Real-time features (chat, notifications)

---

## 📊 Comparison Table

| Feature | Cosmos DB (MongoDB) | SQL Database | PostgreSQL | MySQL |
|---------|---------------------|--------------|------------|-------|
| **Code Changes** | ✅ None (MongoDB API) | ❌ Major (SQL ORM) | ❌ Major (SQL ORM) | ❌ Major (SQL ORM) |
| **Free Tier** | ✅ 25GB free | ⚠️ Limited | ⚠️ Limited | ⚠️ Limited |
| **Schema Flexibility** | ✅ Flexible | ❌ Fixed | ❌ Fixed | ❌ Fixed |
| **Best For Your App** | ✅ **Recommended** | ⚠️ Overkill | ⚠️ Overkill | ⚠️ Overkill |
| **Setup Time** | ⚡ 5 minutes | 🕐 30+ minutes | 🕐 30+ minutes | 🕐 30+ minutes |

---

## 🎯 Recommendation

**Use Azure Cosmos DB with MongoDB API** because:

1. ✅ **Zero code changes** - Your existing Mongoose code works as-is
2. ✅ **Free tier** - 25GB storage + 400 RU/s (enough for testing)
3. ✅ **Fast setup** - 5 minutes to deploy
4. ✅ **Scalable** - Grows with your app
5. ✅ **Global** - Fast worldwide access

---

## 🚀 Quick Start: Cosmos DB Setup

### Step 1: Create Cosmos DB Account
```bash
# Via Azure Portal (recommended)
1. portal.azure.com → Create resource → Azure Cosmos DB
2. Select "Azure Cosmos DB for MongoDB"
3. Enable Free Tier
4. Create
```

### Step 2: Get Connection String
```bash
# In Azure Portal
1. Your Cosmos DB → Connection String
2. Copy "Primary Connection String"
```

### Step 3: Update Environment Variable
```bash
# In Railway/Render
MONGODB_URI=mongodb://account:password@account.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false
```

### Step 4: Deploy
```bash
# Your existing code works! No changes needed.
# Just update the connection string and deploy.
```

---

## 💰 Pricing Comparison

### Cosmos DB (MongoDB API)
- **Free Tier**: 25GB storage + 400 RU/s (free forever)
- **Pay-as-you-go**: ~$0.008 per 100 RU/s per hour
- **Estimated cost**: $0-10/month for small apps

### SQL Database
- **Basic Tier**: $5/month (2GB, 5 DTUs)
- **Standard S0**: $15/month (250GB, 10 DTUs)

### PostgreSQL/MySQL
- **Burstable B1ms**: ~$12/month (1 vCore, 2GB RAM, 32GB storage)
- **General Purpose**: ~$100/month (2 vCores, 10GB RAM)

---

## 🔧 Migration Guide (If Switching from MongoDB)

### If you want to switch to SQL:

1. **Install Sequelize**:
   ```bash
   npm install sequelize mssql  # For SQL Server
   npm install sequelize pg     # For PostgreSQL
   npm install sequelize mysql2 # For MySQL
   ```

2. **Convert Models**:
   ```javascript
   // Old (Mongoose)
   const userSchema = new mongoose.Schema({
     email: String,
     password: String
   });
   
   // New (Sequelize)
   const User = sequelize.define('User', {
     email: { type: DataTypes.STRING, allowNull: false },
     password: { type: DataTypes.STRING, allowNull: false }
   });
   ```

3. **Update Routes**:
   ```javascript
   // Old (Mongoose)
   const user = await User.findById(id);
   
   // New (Sequelize)
   const user = await User.findByPk(id);
   ```

**⚠️ This is a major refactoring** - Consider if it's worth it for your use case.

---

## ✅ Final Recommendation

**For your dating app, use Azure Cosmos DB with MongoDB API** because:

1. ✅ Works with your existing code (no changes needed)
2. ✅ Free tier is generous (25GB)
3. ✅ Fast and scalable
4. ✅ Easy to set up
5. ✅ Global distribution

**Only consider SQL databases if**:
- You need complex SQL queries
- You have strict relational data requirements
- You're willing to refactor your entire backend

---

## 📚 Resources

- [Azure Cosmos DB Docs](https://docs.microsoft.com/azure/cosmos-db/)
- [Azure SQL Database Docs](https://docs.microsoft.com/azure/sql-database/)
- [Azure PostgreSQL Docs](https://docs.microsoft.com/azure/postgresql/)
- [Azure MySQL Docs](https://docs.microsoft.com/azure/mysql/)

---

## 🆘 Need Help?

If you need help setting up any of these databases, let me know which one you'd like to use!
