import { ApplicationRepository } from "../repositories/application.repository.js";
import { assertNonEmpty } from "../utils/validation.js";

export class NotFoundError extends Error {}
export class ForbiddenError extends Error {}

export const ApplicationService = {
  createApplication(userId, data) {
    assertNonEmpty(data.company, "company");
    assertNonEmpty(data.jobTitle, "jobTitle");
    return ApplicationRepository.create({ userId, ...data });
  },

  getUserApplications(userId) {
    return ApplicationRepository.findAllByUser(userId);
  },

  async updateApplication(userId, applicationId, updates) {
    const existing = await ApplicationRepository.findById(applicationId);
    if (!existing) throw new NotFoundError("Application not found.");
    if (existing.userId !== userId) throw new ForbiddenError("Access denied.");

    return ApplicationRepository.update(applicationId, updates);
  },

  async deleteApplication(userId, applicationId) {
    const existing = await ApplicationRepository.findById(applicationId);
    if (!existing) throw new NotFoundError("Application not found.");
    if (existing.userId !== userId) throw new ForbiddenError("Access denied.");

    return ApplicationRepository.delete(applicationId);
  }
};