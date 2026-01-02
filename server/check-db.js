const { Connection } = require('tedious');

const config = {
    server: 'comuno.database.windows.net',
    authentication: {
        type: 'default',
        options: {
            userName: 'CloudSAe20540ec',
            password: 'Comuno@2004', // Using the raw password here as JS string
        }
    },
    options: {
        database: 'comuno',
        encrypt: true,
        trustServerCertificate: false
    }
};

console.log('Attempting to connect with tedious...');
const connection = new Connection(config);

connection.on('connect', err => {
    if (err) {
        console.error('❌ Connection Failed:', err.message);
    } else {
        console.log('✅ Connection Successful!');
    }
    process.exit();
});

connection.connect();
