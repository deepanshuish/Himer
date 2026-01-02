const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    });
} else {
    // PrismaClient is attached to the global object in development to prevent
    // exhausting your database connection limit.
    if (!global.prisma) {
        global.prisma = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL
                }
            }
        });
    }
    prisma = global.prisma;
}

module.exports = prisma;
