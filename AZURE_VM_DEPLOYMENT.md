# 🌐 Azure VM Deployment Guide - Himer

This guide covers the deployment of the Himer application (Next.js + Express + Azure SQL) to an Azure VM.

## 1. Connect to your VM
```bash
ssh -i /path/to/your/key.pem azureuser@YOUR_VM_IP
```

## 2. Install Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

## 3. Clone and Setup
```bash
git clone https://github.com/deepanshuish/Himer.git
cd Himer

# Install dependencies
npm install

# Generate Prisma Client (Required for Azure SQL)
npx prisma generate
```

## 4. Environment Configuration
Create a `.env.local` for the frontend and update your environment variables.

```bash
# Frontend env
cat <<EOF > .env.local
NEXT_PUBLIC_API_URL=http://YOUR_VM_IP
EOF
```

For the backend, you can use the `ecosystem.config.js` or a `.env` in the `server` folder.
**Recommendation:** Edit `ecosystem.config.js` to include your `DATABASE_URL` (Azure SQL connection string) and a secure `JWT_SECRET`.

## 5. Build and Run
```bash
# Build Next.js
npm run build

# Start both frontend and backend using PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save
sudo pm2 startup
```

## 6. Configure Nginx
Create a new Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/himer
```

Paste the following (Replace `YOUR_VM_IP`):
```nginx
server {
    listen 80;
    server_name YOUR_VM_IP;

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend App
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/himer /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## 7. Azure Networking
Ensure ports **80** (HTTP) and **443** (HTTPS) are open in your Azure VM's Network Security Group (NSG).

---
🎉 **Your app should now be live at `http://YOUR_VM_IP`!**
