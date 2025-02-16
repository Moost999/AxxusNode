// src/services/userService.ts
import prisma from "../lib/prisma"
import bcrypt from 'bcrypt'

interface CreateUserData {
  name: string
  email: string
  password: string
}

export async function createUser(data: CreateUserData) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    throw new Error("Email already registered")
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      tokens: 0,          // Valor padrão conforme schema
      availableMessages: 100, // Valor padrão
      adViews: 0,
      adCooldown: 24
    }
  })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    tokens: user.tokens,
    availableMessages: user.availableMessages
  }
}

// Adicione a função faltante
export async function getUserTokens(id: string) {
  const user = await prisma.user.findUnique({ 
    where: { id },
    select: { tokens: true }
  })
  
  if (!user) throw new Error("User not found")
  return user.tokens
}