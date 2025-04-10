import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LeadService {
  async addLead(phone: string, assistantId: string) {
    return prisma.lead.upsert({
      where: { phone_assistantId: { phone, assistantId } },
      update: {},
      create: { phone, assistantId }
    });
  }

  async getLeads(assistantId: string) {
    return prisma.lead.findMany({
      where: { assistantId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getLeadsByUserId(userId: string) {
    return prisma.lead.findMany({
      where: {
        assistant: {
          userId: userId
        }
      },
      include: {
        assistant: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}