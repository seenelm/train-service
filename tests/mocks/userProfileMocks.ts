import { IUserProfileService } from "../../src/app/userProfile/UserProfileService.js";
import { vi } from "vitest";

export const mockUserProfileService: IUserProfileService = {
  updateUserProfile: vi.fn(),
  updateCustomSection: vi.fn(),
  createCustomSection: vi.fn(),
};
