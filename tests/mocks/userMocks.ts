import { IUserRepository } from "../../src/infrastructure/database/repositories/user/UserRepository.js";
import { IUserProfileRepository } from "../../src/infrastructure/database/repositories/user/UserProfileRepository.js";
import { IUserGroupsRepository } from "../../src/infrastructure/database/repositories/user/UserGroupsRepository.js";
import { IFollowRepository } from "../../src/infrastructure/database/repositories/user/FollowRepository.js";
import { IPasswordResetRepository } from "../../src/infrastructure/database/repositories/user/PasswordResetRepository.js";
import { IEmailService } from "../../src/infrastructure/EmailService.js";
import { vi } from "vitest";
import { IUserService } from "../../src/app/user/UserService.js";
import BaseRepository from "../../src/infrastructure/database/repositories/BaseRepository.js";
import PasswordReset from "../../src/infrastructure/database/entity/user/PasswordReset.js";
import { PasswordResetDocument } from "../../src/infrastructure/database/models/user/passwordResetModel.js";

export const mockUserRepository: IUserRepository = {
  toDocument: vi.fn(),
  toDocumentFromEntity: vi.fn(),
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

class MockPasswordResetRepository extends BaseRepository<PasswordReset, PasswordResetDocument> {
  constructor() {
    super({} as any);
  }

  toEntity = vi.fn();
  findById = vi.fn();
  findOne = vi.fn();
  find = vi.fn();
  create = vi.fn();
  insertMany = vi.fn();
  findOneAndUpdate = vi.fn();
  findByIdAndUpdate = vi.fn();
  updateOne = vi.fn();
  updateMany = vi.fn();
  findByIdAndDelete = vi.fn();
  deleteMany = vi.fn();
}

export const mockPasswordResetRepository = new MockPasswordResetRepository();

export const mockEmailService: IEmailService = {
  sendPasswordResetCode: vi.fn(),
};

export const mockUserService: IUserService = {
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  authenticateWithGoogle: vi.fn(),
  refreshTokens: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPasswordWithCode: vi.fn(),
  logoutUser: vi.fn(),
};
