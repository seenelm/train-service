import { IUserRepository } from "../../src/infrastructure/database/repositories/user/UserRepository.js";
import { IUserProfileRepository } from "../../src/infrastructure/database/repositories/user/UserProfileRepository.js";
import { IUserGroupsRepository } from "../../src/infrastructure/database/repositories/user/UserGroupsRepository.js";
import { IFollowRepository } from "../../src/infrastructure/database/repositories/user/FollowRepository.js";
import { IPasswordResetRepository } from "../../src/infrastructure/database/repositories/user/PasswordResetRepository.js";
import { IEmailService } from "../../src/infrastructure/EmailService.js";
import { vi } from "vitest";
import { IUserService } from "../../src/app/user/UserService.js";

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
  deleteOne: vi.fn(),
  countDocuments: vi.fn(),
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
  deleteOne: vi.fn(),
  countDocuments: vi.fn(),
  toDocument: vi.fn(),
  toResponse: vi.fn(),
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
  deleteOne: vi.fn(),
  countDocuments: vi.fn(),
  getUserGroupsWithDetails: vi.fn(),
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
  deleteOne: vi.fn(),
  countDocuments: vi.fn(),
  getFollowersCount: vi.fn(),
  getFollowingCount: vi.fn(),
  getFollowersPaginated: vi.fn(),
  getFollowingPaginated: vi.fn(),
  searchFollowers: vi.fn(),
  searchFollowing: vi.fn(),
};

export const mockPasswordResetRepository: IPasswordResetRepository = {
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
};

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
  expireRefreshToken: vi.fn(),
  getResetCode: vi.fn(),
};
