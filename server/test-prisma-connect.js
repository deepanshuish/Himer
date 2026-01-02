const { PrismaClient } = require('@prisma/client');

async function testConnection(passwordVariant, description) {
    console.log(`\nTesting: ${description}`);
    const dbUrl = `sqlserver://comuno.database.windows.net:1433;database=comuno;user=CloudSAe20540ec;encrypt=true;trustServerCertificate=false;loginTimeout=30;password=${passwordVariant}`;

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: dbUrl
            }
        }
    });

    try {
        await prisma.$connect();
        console.log('✅ SUCCESS!');
        return true;
    } catch (e) {
        console.log('❌ Failed:', e.message.split('\n').pop()); // Print last line of error
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

async function run() {
    const variants = [
        { desc: 'URL Encoded (@ -> %40)', pwd: 'Comuno%402004' },
        { desc: 'Raw String', pwd: 'Comuno@2004' },
        { desc: 'Braced ({...})', pwd: '{Comuno@2004}' },
    ];

    for (const v of variants) {
        if (await testConnection(v.pwd, v.desc)) {
            console.log(`\n🎉 FOUND WORKING FORMAT: ${v.desc}`);
            console.log(`Password part should be: password=${v.pwd}`);
            process.exit(0);
        }
    }
    console.log('\n❌ All variants failed.');
    process.exit(1);
}

run();
