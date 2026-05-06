import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from './generated/client'

const adapter = new PrismaMariaDb({
  host: 'localhost', // your database host
  user: 'root', // your database username
  password: process.env.DB_PASS, // your database password
  database: process.env.DB_NAME // optional, your database name
})

const prisma = new PrismaClient({ adapter })
export default prisma