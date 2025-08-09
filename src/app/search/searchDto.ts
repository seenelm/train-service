import { UserProfileResponse } from "@seenelm/train-core";
import { GroupResponse } from "../group/groupDto.js";

export interface SearchProfilesResponse {
  userProfiles: UserProfileResponse[];
  groups: GroupResponse[];
}
