import { Schema, model, Types, Document } from "mongoose";
import { ProfileAccess } from "../../../../common/enums.js";

export interface UserProfileDocument extends Document {
  userId: Types.ObjectId;
  username: string;
  name: string;
  bio: string;
  accountType: number;
  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    accountType: {
      type: Number,
      enum: [ProfileAccess.Public, ProfileAccess.Private],
      default: ProfileAccess.Public,
    },
  },
  { timestamps: true }
);

export const UserProfileModel = model<UserProfileDocument>(
  "UserProfile",
  userProfileSchema
);
