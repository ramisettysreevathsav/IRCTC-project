const {prismaClient} = require('@prisma/client');
const {prismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/user_service_db';

const globalForPrisma = globalThis;

if (!globalForPrisma.prisma) {
    const adapter = new prismaPg({
        connectionString,
    });
    
    globalForPrisma.prisma = new prismaClient({
        adapter,
        log: ['warn', 'error'],
    });
}

const prisma = globalForPrisma.prisma;

module.exports = { prisma };