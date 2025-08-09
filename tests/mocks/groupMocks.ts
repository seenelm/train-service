import { vi } from "vitest";
import { IGroupRepository } from "../../src/infrastructure/database/repositories/group/GroupRepository.js";

export const mockGroupRepository: IGroupRepository = {
  findById: vi.fn(),
  findOne: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
  insertMany: vi.fn(),
  findOneAndUpdate: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  updateOne: vi.fn(),
  updateMany: vi.fn(),
  findByIdAndDelete: vi.fn(),
  deleteMany: vi.fn(),
  deleteOne: vi.fn(),
  countDocuments: vi.fn(),
  toDocument: vi.fn(),
  toDocumentFromEntity: vi.fn(),
  toResponse: vi.fn(),
};
