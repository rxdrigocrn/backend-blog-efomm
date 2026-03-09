import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {

  const password = await bcrypt.hash('123456', 10)

  await prisma.user.create({
    data: {
      email: 'presida@blog.com',
      nome: 'Presidente',
      password,
      role: Role.PRESIDENTE,
    },
  })

  console.log('✅ Presidente criado')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })