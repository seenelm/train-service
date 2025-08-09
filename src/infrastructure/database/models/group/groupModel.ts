import { Schema, model, Types, Document } from "mongoose";
import { ProfileAccess } from "@seenelm/train-core";

export interface GroupDocument extends Document {
  groupName: string;
  bio: string;
  owners: Types.ObjectId[];
  members: Types.ObjectId[];
  requests: Types.ObjectId[];
  accountType: ProfileAccess;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema(
  {
    groupName: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    owners: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    requests: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    accountType: {
      type: Number,
      enum: [ProfileAccess.Public, ProfileAccess.Private],
      default: ProfileAccess.Public,
    },
  },
  { timestamps: true }
);

export const GroupModel = model<GroupDocument>("Group", groupSchema);
