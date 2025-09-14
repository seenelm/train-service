import { Schema, model, Document, Types } from "mongoose";
import { ProfileAccess } from "@seenelm/train-core";

export interface Phase {
  name: string;
  startWeek: number;
  endWeek: number;
}

// TODO: add startDate and endDate
export interface ProgramDocument extends Document {
  name: string;
  types?: string[];
  numWeeks: number;
  hasNutritionProgram?: boolean;
  phases?: Phase[];
  accessType: ProfileAccess;
  admins: Types.ObjectId[];
  createdBy: Types.ObjectId;
  members?: Types.ObjectId[];
  weeks?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const PhaseSchema = new Schema(
  {
    name: { type: String, required: true },
    startWeek: { type: Number, required: true },
    endWeek: { type: Number, required: true },
  },
  { _id: false }
);

const ProgramSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    types: {
      type: [String],
      required: false,
    },
    numWeeks: {
      type: Number,
      required: true,
    },
    hasNutritionProgram: {
      type: Boolean,
      required: false,
    },
    phases: {
      type: [PhaseSchema],
      required: false,
    },
    accessType: {
      type: Number,
      enum: [ProfileAccess.Public, ProfileAccess.Private],
      required: true,
    },
    admins: {
      type: [Types.ObjectId],
      ref: "User",
      default: [],
      required: true,
    },
    members: {
      type: [Types.ObjectId],
      ref: "User",
      required: false,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    weeks: {
      type: [Types.ObjectId],
      ref: "Week",
      required: false,
    },
  },
  { timestamps: true }
);

export const ProgramModel = model<ProgramDocument>("Program", ProgramSchema);
