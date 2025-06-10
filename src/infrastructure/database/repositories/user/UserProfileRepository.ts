import { UserProfileDocument } from "../../models/user/userProfileModel.js";
import UserProfile from "../../entity/user/UserProfile.js";
import { IBaseRepository, BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";
import {
  UserProfileRequest,
  UserProfileRole,
  SocialPlatform,
} from "@seenelm/train-core";

export interface IUserProfileRepository
  extends IBaseRepository<UserProfile, UserProfileDocument> {
  toDocument(request: UserProfileRequest): Partial<UserProfileDocument>;
}

export default class UserProfileRepository
  extends BaseRepository<UserProfile, UserProfileDocument>
  implements IUserProfileRepository
{
  private userProfileModel: Model<UserProfileDocument>;

  constructor(userProfileModel: Model<UserProfileDocument>) {
    super(userProfileModel);
    this.userProfileModel = userProfileModel;
  }

  toEntity(doc: UserProfileDocument): UserProfile {
    return UserProfile.builder()
      .setId(doc._id as Types.ObjectId)
      .setUserId(doc.userId as Types.ObjectId)
      .setUsername(doc.username)
      .setName(doc.name)
      .setBio(doc.bio ?? "")
      .setAccountType(doc.accountType)
      .setCreatedAt(doc.createdAt)
      .setUpdatedAt(doc.updatedAt)
      .build();
  }

  toDocument(request: UserProfileRequest): Partial<UserProfileDocument> {
    return {
      userId: new Types.ObjectId(request.userId),
      username: request.username,
      name: request.name,
      bio: request.bio,
      accountType: request.accountType,
      profilePicture: request.profilePicture,
      role: request.role as UserProfileRole[],
      socialLinks: request.socialLinks?.map((link) => ({
        platform: link.platform as SocialPlatform,
        url: link.url,
      })),
    };
  }
}
