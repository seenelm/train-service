import { Schema, model, Types, Document } from "mongoose";
import { ProfileAccess } from "@seenelm/train-core";

export interface GroupDocument extends Document {
  name: string;
  description?: string;
  location?: string;
  tags?: string[];
  owners: Types.ObjectId[];
  members: Types.ObjectId[];
  requests: Types.ObjectId[];
  accountType: ProfileAccess;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    tags: {
      type: [String],
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
