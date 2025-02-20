import { PrismaClient } from "@prisma/client";

// Declare global type for the prisma client
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client instance
export const prisma = global.prisma || new PrismaClient();

// In development, save the client to the global object to prevent
// creating multiple instances during hot-reloading
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}