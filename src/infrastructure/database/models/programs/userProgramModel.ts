import { Schema, model, Types, Document } from "mongoose";

export interface UserProgramDocument extends Document {
  userId: Types.ObjectId;
  programs: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userProgramSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    programs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Program",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export const UserProgramModel = model<UserProgramDocument>(
  "UserProgram",
  userProgramSchema
);
