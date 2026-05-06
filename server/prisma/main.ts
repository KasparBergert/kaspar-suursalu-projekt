import '../../env.ts'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/client'

const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT ?? 20)

const adapter = new PrismaMariaDb({
  host: 'localhost', // your database host
  user: 'root', // your database username
  password: process.env.DB_PASS, // your database password
  database: process.env.DB_NAME, // optional, your database name
  connectionLimit,
})

const prisma = new PrismaClient({ adapter })
export default prisma
