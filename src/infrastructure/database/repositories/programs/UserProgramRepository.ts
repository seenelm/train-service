import { IBaseRepository } from "../BaseRepository.js";
import UserProgram from "../../entity/program/UserProgram.js";
import { UserProgramDocument } from "../../models/programs/userProgramModel.js";
import { BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";

export interface IUserProgramRepository
  extends IBaseRepository<UserProgram, UserProgramDocument> {}

export default class UserProgramRepository
  extends BaseRepository<UserProgram, UserProgramDocument>
  implements IUserProgramRepository
{
  private userProgramModel: Model<UserProgramDocument>;

  constructor(userProgramModel: Model<UserProgramDocument>) {
    super(userProgramModel);
    this.userProgramModel = userProgramModel;
  }

  toEntity(doc: UserProgramDocument): UserProgram {
    return UserProgram.builder()
      .setId(doc._id as Types.ObjectId)
      .setUserId(doc.userId as Types.ObjectId)
      .setPrograms(doc.programs as Types.ObjectId[])
      .setCreatedAt(doc.createdAt)
      .setUpdatedAt(doc.updatedAt)
      .build();
  }
}
