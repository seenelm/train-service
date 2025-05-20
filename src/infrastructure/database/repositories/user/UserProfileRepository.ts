import { UserProfileDocument } from "../../models/user/userProfileModel.js";
import UserProfile from "../../entity/user/UserProfile.js";
import { IBaseRepository, BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";

export interface IUserProfileRepository
  extends IBaseRepository<UserProfile, UserProfileDocument> {}

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
      .setBio(doc.bio)
      .setAccountType(doc.accountType)
      .setCreatedAt(doc.createdAt)
      .setUpdatedAt(doc.updatedAt)
      .build();
  }
}
