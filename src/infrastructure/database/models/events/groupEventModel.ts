import { Schema, model, Types, Document } from "mongoose";

export interface GroupEventDocument extends Document {
  groupId: Types.ObjectId;
  events: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const groupEventSchema: Schema = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    events: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export const GroupEvent = model<GroupEventDocument>(
  "GroupEvent",
  groupEventSchema
);
