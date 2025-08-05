import { ProfileAccess } from "@seenelm/train-core";

/**
 * Create Group Request DTO
 * Used for creating new groups
 */
export interface CreateGroupRequest {
  groupName: string; // Required
  bio?: string; // Optional
  accountType?: ProfileAccess; // Optional, defaults to Public
}

/**
 * Update Group Request DTO
 * Used for updating existing groups
 */
export interface UpdateGroupProfileRequest {
  groupName: string; // Optional
  bio: string; // Optional
  accountType: ProfileAccess; // Optional
}

/**
 * Group Response DTO
 * Used for returning group data
 */
export interface GroupResponse {
  id: string;
  groupName: string;
  bio?: string;
  owners: string[];
  members: string[];
  requests: string[];
  accountType: ProfileAccess;
}

export interface UserGroupsResponse {
  userId: string;
  groups: GroupResponse[];
}
