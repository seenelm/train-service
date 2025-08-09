import { ICertificationRepository } from "../../src/infrastructure/database/repositories/userProfile/CertificationRepository.js";
import { ISearchService } from "../../src/app/search/SearchService.js";
import { ISearchRepository } from "../../src/infrastructure/database/repositories/search/SearchRepository.js";
import { vi } from "vitest";

export const mockCertificationRepository: ICertificationRepository = {
  searchCertifications: vi.fn(),
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

export const mockSearchRepository: ISearchRepository = {
  searchProfiles: vi.fn(),
};

export const mockSearchService: ISearchService = {
  searchCertifications: vi.fn(),
  searchProfiles: vi.fn(),
};
