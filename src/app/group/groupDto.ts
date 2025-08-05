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
export interface UpdateGroupRequest {
  groupName?: string; // Optional
  bio?: string; // Optional
  accountType?: ProfileAccess; // Optional
}

/**
 * Add Members Request DTO
 * Used for adding members to a group
 */
export interface AddMembersRequest {
  memberIds: string[]; // Required
}

/**
 * Remove Members Request DTO
 * Used for removing members from a group
 */
export interface RemoveMembersRequest {
  memberIds: string[]; // Required
}

/**
 * Add Owners Request DTO
 * Used for adding owners to a group
 */
export interface AddOwnersRequest {
  ownerIds: string[]; // Required
}

/**
 * Remove Owners Request DTO
 * Used for removing owners from a group
 */
export interface RemoveOwnersRequest {
  ownerIds: string[]; // Required
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
  createdAt?: Date;
  updatedAt?: Date;
}
