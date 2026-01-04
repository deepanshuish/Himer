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
                PORT: 5001
            }
        }
    ]
};
