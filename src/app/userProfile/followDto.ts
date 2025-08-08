// Cursor-based pagination request
export interface CursorPaginationRequest {
  limit: number;
  cursor?: string; // Base64 encoded cursor
}

// Cursor-based pagination response
export interface CursorPaginationResponse<T> {
  data: T[];
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}

// Minimal user info for follow lists (performance optimized)
export interface FollowUserInfo {
  userId: string;
  username: string;
  name: string;
  profilePicture?: string;
  isFollowing?: boolean; // If requesting user is following this user
}

// Follow statistics (fast, cached)
export interface FollowStatsResponse {
  userId: string;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

// Followers response
export interface FollowersResponse
  extends CursorPaginationResponse<FollowUserInfo> {}

// Following response
export interface FollowingResponse
  extends CursorPaginationResponse<FollowUserInfo> {}

// Search within followers/following
export interface FollowSearchRequest extends CursorPaginationRequest {
  searchTerm: string;
}

export interface FollowSearchResponse
  extends CursorPaginationResponse<FollowUserInfo> {}
