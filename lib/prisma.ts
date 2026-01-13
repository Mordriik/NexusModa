import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Cria o pool de conexões usando o driver nativo 'pg'
const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
// Cria o adaptador do Prisma para esse pool
const adapter = new PrismaPg(pool)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // <--- A Mágica do Prisma 7: passamos o adaptador aqui
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma