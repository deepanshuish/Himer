module.exports = {
    apps: [
        {
            name: 'himer-frontend',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        },
        {
            name: 'himer-backend',
            script: 'node',
            cwd: './server',
            args: 'index.js',
            env: {
                NODE_ENV: 'production',
                PORT: 5000,
                DATABASE_URL: 'sqlserver://comuno.database.windows.net:1433;database=comuno;user=CloudSAe20540ec;password={your_password};encrypt=true;trustServerCertificate=false;loginTimeout=30;',
                JWT_SECRET: 'comuno_prod_secret_8822'
            }
        }
    ]
};
