import { UserProfileResponse } from "@seenelm/train-core";
import { GroupResponse } from "@seenelm/train-core";

export interface SearchProfilesResponse {
  userProfiles: UserProfileResponse[];
  groups: GroupResponse[];
}
