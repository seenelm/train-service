import { FollowDocument } from "../../models/user/followModel.js";
import Follow from "../../entity/user/Follow.js";
import { IBaseRepository, BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";

export interface IFollowRepository
  extends IBaseRepository<Follow, FollowDocument> {}

export default class FollowRepository
  extends BaseRepository<Follow, FollowDocument>
  implements IFollowRepository
{
  private followModel: Model<FollowDocument>;

  constructor(followModel: Model<FollowDocument>) {
    super(followModel);
    this.followModel = followModel;
  }

  toEntity(doc: FollowDocument): Follow {
    return Follow.builder()
      .setId(doc._id as Types.ObjectId)
      .setUserId(doc.userId as Types.ObjectId)
      .setFollowing(doc.following as Types.ObjectId[])
      .setFollowers(doc.followers as Types.ObjectId[])
      .setRequests(doc.requests as Types.ObjectId[])
      .setCreatedAt(doc.createdAt)
      .setUpdatedAt(doc.updatedAt)
      .build();
  }
}
