import { IUserProfileService } from "../../src/app/userProfile/UserProfileService.js";
import { vi } from "vitest";

export const mockUserProfileService: IUserProfileService = {
  updateUserProfile: vi.fn(),
  updateCustomSection: vi.fn(),
  updateBasicUserProfileInfo: vi.fn(),
  createCustomSection: vi.fn(),
  getCustomSections: vi.fn(),
  deleteCustomSection: vi.fn(),
  followUser: vi.fn(),
  requestToFollowUser: vi.fn(),
  acceptFollowRequest: vi.fn(),
  rejectFollowRequest: vi.fn(),
  unfollowUser: vi.fn(),
  removeFollower: vi.fn(),
  fetchUserGroups: vi.fn(),
  getFollowStats: vi.fn(),
  getFollowers: vi.fn(),
  getFollowing: vi.fn(),
  searchFollowers: vi.fn(),
  searchFollowing: vi.fn(),
};
