import { Schema, model, Types, Document } from "mongoose";

export interface UserGroupsDocument extends Document {
  userId: Types.ObjectId;
  groups: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userGroupsSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groups: [
      {
        type: Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
  },
  { timestamps: true }
);

export const UserGroupsModel = model<UserGroupsDocument>(
  "UserGroups",
  userGroupsSchema
);
