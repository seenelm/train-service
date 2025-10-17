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
      groupFilter.name = { $regex: searchTerm, $options: "i" };
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Execute parallel searches using repository methods
    // Use full limit for each type to ensure we get enough results
    const [userProfiles, groups, userProfileCount, groupCount] =
      await Promise.all([
        this.userProfileRepository.find(userProfileFilter, {
          skip,
          limit,
          sort: { username: 1 }, // Sort by username for consistent results
        }),
        this.groupRepository.find(groupFilter, {
          skip,
          limit,
          sort: { name: 1 }, // Sort by group name for consistent results
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
        a.getName().toLowerCase() === searchTerm.toLowerCase();
      const bExactMatch =
        b.getName().toLowerCase() === searchTerm.toLowerCase();

      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      return a.getName().localeCompare(b.getName());
    });

    const totalItems = userProfileCount + groupCount;
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Combine and limit results to respect the requested limit
    const combinedResults = [...userProfiles, ...groups];
    const limitedResults = combinedResults.slice(0, limit);

    // Separate back into userProfiles and groups for the response
    const finalUserProfiles = limitedResults.filter(
      (result) => "getUsername" in result
    ) as UserProfile[];
    const finalGroups = limitedResults.filter(
      (result) => "getName" in result && !("getUsername" in result)
    ) as Group[];

    return {
      data: [
        {
          userProfiles: finalUserProfiles,
          groups: finalGroups,
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
