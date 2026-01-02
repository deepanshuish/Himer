const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({});
} else {
    // PrismaClient is attached to the global object in development to prevent
    // exhausting your database connection limit.
    if (!global.prisma) {
        global.prisma = new PrismaClient({});
    }
    prisma = global.prisma;
}

module.exports = prisma;
