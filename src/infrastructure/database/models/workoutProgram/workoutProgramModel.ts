import { Schema, model, Document, Types } from "mongoose";

export interface Week {
  weekNumber: number;
  name: string;
  description?: string;
  workouts: Types.ObjectId[];
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}

export interface WorkoutProgramDocument extends Document {
  ownerType: string;
  ownerId: Types.ObjectId;
  name: string;
  description?: string;
  weeks: Week[];
  createdAt?: Date;
  updatedAt?: Date;
}

const weekSchema = new Schema(
  {
    weekNumber: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String, required: false },
    workouts: [{ type: Types.ObjectId, ref: "WorkoutTemplate", default: [] }],
    isActive: { type: Boolean, required: false, default: false },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
    notes: { type: String, required: false },
  },
  { _id: false }
);

const WorkoutProgramSchema = new Schema(
  {
    ownerType: { type: String, enum: ["User", "Group"], required: true },
    ownerId: { type: Types.ObjectId, required: true }, // points to User or Group
    name: { type: String, required: true },
    description: { type: String, required: false },
    weeks: [weekSchema],
  },
  { timestamps: true }
);

export const WorkoutProgramModel = model<WorkoutProgramDocument>(
  "WorkoutProgram",
  WorkoutProgramSchema
);
