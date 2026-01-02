const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');

// The correctly encoded connection string
// Comuno@2004 -> Comuno%402004
const dbUrl = 'sqlserver://comuno.database.windows.net:1433;database=comuno;user=CloudSAe20540ec;password=Comuno%402004;encrypt=true;trustServerCertificate=false;loginTimeout=30;';
const jwtSecret = 'comuno_prod_secret_8822';

const envContent = `DATABASE_URL="${dbUrl}"
JWT_SECRET="${jwtSecret}"
NODE_ENV="production"
PORT=5000
`;

console.log('Overwriting .env file with correct encoding...');
try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file fixed successfully!');
    console.log('Path:', envPath);
    console.log('Content:\n', envContent);
} catch (err) {
    console.error('❌ Failed to write .env:', err);
}
