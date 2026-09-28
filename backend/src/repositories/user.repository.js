import { prisma } from "../db/client.js";

export const UserRepository = {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },
  findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, displayName: true, createdAt: true }
    });
  },
  create({ email, displayName, passwordHash }) {
    return prisma.user.create({
      data: { email, displayName, passwordHash },
      select: { id: true, email: true, displayName: true, createdAt: true }
    });
  }
};