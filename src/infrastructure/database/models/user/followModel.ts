import { Schema, model, Types, Document } from "mongoose";

export interface FollowDocument extends Document {
  userId: Types.ObjectId;
  following: Types.ObjectId[];
  followers: Types.ObjectId[];
  requests: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const followSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "UserProfile",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "UserProfile",
      },
    ],
    requests: [
      {
        type: Schema.Types.ObjectId,
        ref: "UserProfile",
      },
    ],
  },
  { timestamps: true }
);

export const FollowModel = model<FollowDocument>("Follow", followSchema);
