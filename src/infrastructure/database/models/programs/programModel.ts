import { Schema, model, Document, Types } from "mongoose";
import { ProfileAccess } from "@seenelm/train-core";

export interface Phase {
  name: string;
  startWeek: number;
  endWeek: number;
}

export interface ProgramDocument extends Document {
  name: string;
  types?: string[];
  numWeeks: number;
  hasNutritionProgram?: boolean;
  phases?: Phase[];
  accessType: ProfileAccess;
  createdBy: Types.ObjectId;
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
      enum: Object.values(ProfileAccess),
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const ProgramModel = model<ProgramDocument>("Program", ProgramSchema);
