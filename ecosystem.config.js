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
                PORT: 5001,
                DATABASE_URL: 'REPLACE_WITH_YOUR_AZURE_SQL_CONNECTION_STRING',
                JWT_SECRET: 'REPLACE_WITH_A_SECURE_SECRET'
            }
        }
    ]
};
