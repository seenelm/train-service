import { Schema, model, Types, Document } from "mongoose";

export interface GroupProgramsDocument extends Document {
  groupId: Types.ObjectId;
  programs: Types.ObjectId[];
}

const groupProgramsSchema = new Schema({
  groupId: {
    type: Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  programs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Program",
    },
  ],
});

export const GroupProgramsModel = model<GroupProgramsDocument>(
  "GroupPrograms",
  groupProgramsSchema
);
