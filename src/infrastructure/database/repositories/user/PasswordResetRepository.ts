import PasswordReset from "../../entity/user/PasswordReset.js";
import { PasswordResetDocument } from "../../models/user/passwordResetModel.js";
import { IBaseRepository, BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";

export interface IPasswordResetRepository
  extends IBaseRepository<PasswordReset, PasswordResetDocument> {}

export default class PasswordResetRepository
  extends BaseRepository<PasswordReset, PasswordResetDocument>
  implements IPasswordResetRepository
{
  private passwordResetModel: Model<PasswordResetDocument>;

  constructor(passwordResetModel: Model<PasswordResetDocument>) {
    super(passwordResetModel);
    this.passwordResetModel = passwordResetModel;
  }

  toEntity(doc: PasswordResetDocument): PasswordReset {
    return PasswordReset.builder()
      .setId(doc._id as Types.ObjectId)
      .setUserId(doc.userId)
      .setEmail(doc.email)
      .setCode(doc.code)
      .setExpiresAt(doc.expiresAt)
      .setCreatedAt(doc.createdAt)
      .build();
  }
}
