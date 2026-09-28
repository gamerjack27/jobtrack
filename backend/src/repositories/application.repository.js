import { prisma } from "../db/client.js";

export const ApplicationRepository = {
  create({ userId, company, jobTitle, location, salary, status, notes }) {
    return prisma.application.create({
      data: { userId, company, jobTitle, location, salary, status, notes }
    });
  },

  findAllByUser(userId) {
    return prisma.application.findMany({
      where: { userId },
      include: { contacts: true},
      orderBy: { updatedAt: "desc" }
    });
  },

  findById(id) {
    return prisma.application.findUnique({
      where: { id },
      include: { contacts: true}
    });
  },

  update(id, data) {
    return prisma.application.update({
      where: { id },
      data
    });
  },

  delete(id) {
    return prisma.application.delete({
      where: { id }
    });
  }
};