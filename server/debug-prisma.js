const path = require('path');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

const envPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
    const masked = process.env.DATABASE_URL.replace(/password=[^;]+/, 'password=****').replace(/:([^:@]+)@/, ':****@');
    console.log('DATABASE_URL (masked):', masked);
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    },
    log: ['query', 'info', 'warn', 'error'],
});

async function test() {
    console.log('Attempting prisma.$connect()...');
    try {
        await prisma.$connect();
        console.log('✅ Prisma connected successfully!');

        console.log('Attempting a simple query (count users)...');
        const count = await prisma.user.count();
        console.log('✅ Query success! User count:', count);
    } catch (err) {
        console.error('❌ Prisma failed:', err.message);
        console.error('Error code:', err.code);
        console.error('Meta:', err.meta);
    } finally {
        await prisma.$disconnect();
    }
}

test();
