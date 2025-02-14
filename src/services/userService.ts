import prisma from "../lib/prisma";

export async function createUser(data: { name: string; email: string }) {
  return prisma.user.create({ data })
}

export async function getUserTokens(id: string) {
  const user = await prisma.user.findUnique({ where: { id } })
  return user?.tokens || 0
}

export async function deductTokens(id: string, amount: number) {
  return prisma.user.update({
    where: { id },
    data: { tokens: { decrement: amount } },
  })
}

