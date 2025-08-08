import { Types } from "mongoose";
import UserProfile from "../../entity/user/UserProfile.js";
import Group from "../../entity/group/Group.js";
import { PaginationRequest, PaginationResponse } from "@seenelm/train-core";
import { IUserProfileRepository } from "../user/UserProfileRepository.js";
import { IGroupRepository } from "../group/GroupRepository.js";

export interface SearchProfilesResult {
  userProfiles: UserProfile[];
  groups: Group[];
}

export interface ISearchRepository {
  searchProfiles(
    searchTerm: string,
    paginationRequest: PaginationRequest
  ): Promise<PaginationResponse<SearchProfilesResult>>;
}

export default class SearchRepository implements ISearchRepository {
  private userProfileRepository: IUserProfileRepository;
  private groupRepository: IGroupRepository;

  constructor(
    userProfileRepository: IUserProfileRepository,
    groupRepository: IGroupRepository
  ) {
    this.userProfileRepository = userProfileRepository;
    this.groupRepository = groupRepository;
  }

  async searchProfiles(
    searchTerm: string,
    paginationRequest: PaginationRequest
  ): Promise<PaginationResponse<SearchProfilesResult>> {
    const { page, limit } = paginationRequest;

    // Build filter queries
    const userProfileFilter: any = {};
    const groupFilter: any = {};

    if (searchTerm) {
      userProfileFilter.$or = [
        { username: { $regex: searchTerm, $options: "i" } },
        { name: { $regex: searchTerm, $options: "i" } },
      ];
      groupFilter.groupName = { $regex: searchTerm, $options: "i" };
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Execute parallel searches using repository methods
    const [userProfiles, groups, userProfileCount, groupCount] =
      await Promise.all([
        this.userProfileRepository.find(userProfileFilter, {
          skip,
          limit: Math.ceil(limit / 2),
        }),
        this.groupRepository.find(groupFilter, {
          skip,
          limit: Math.ceil(limit / 2),
        }),
        this.userProfileRepository.countDocuments(userProfileFilter),
        this.groupRepository.countDocuments(groupFilter),
      ]);

    // Sort by relevance (exact matches first, then partial matches)
    userProfiles.sort((a: UserProfile, b: UserProfile) => {
      const aExactMatch =
        a.getUsername().toLowerCase() === searchTerm.toLowerCase();
      const bExactMatch =
        b.getUsername().toLowerCase() === searchTerm.toLowerCase();

      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      return a.getUsername().localeCompare(b.getUsername());
    });

    groups.sort((a: Group, b: Group) => {
      const aExactMatch =
        a.getGroupName().toLowerCase() === searchTerm.toLowerCase();
      const bExactMatch =
        b.getGroupName().toLowerCase() === searchTerm.toLowerCase();

      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      return a.getGroupName().localeCompare(b.getGroupName());
    });

    const totalItems = userProfileCount + groupCount;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: [
        {
          userProfiles,
          groups,
        },
      ],
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }
}
