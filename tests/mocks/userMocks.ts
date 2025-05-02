import { IUserRepository } from "../../src/infrastructure/database/repositories/user/UserRepository.js";
import { IUserProfileRepository } from "../../src/infrastructure/database/repositories/user/UserProfileRepository.js";
import { IUserGroupsRepository } from "../../src/infrastructure/database/repositories/user/UserGroupsRepository.js";
import { IFollowRepository } from "../../src/infrastructure/database/repositories/user/FollowRepository.js";
import { vi } from "vitest";

export const mockUserRepository: IUserRepository = {
  toDocument: vi.fn(),
  toResponse: vi.fn(),
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
};

export const mockUserProfileRepository: IUserProfileRepository = {
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
};

export const mockUserGroupsRepository: IUserGroupsRepository = {
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
};

export const mockFollowRepository: IFollowRepository = {
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
};
