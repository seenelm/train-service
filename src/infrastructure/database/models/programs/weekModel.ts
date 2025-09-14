import { Schema, model, Document, Types } from "mongoose";
import { ProfileAccess } from "@seenelm/train-core";

export interface Exercise {
  exerciseId: Types.ObjectId;
  targetSets?: number;
  targetReps?: number;
  targetDurationSec?: number;
  targetWeight?: number;
  notes?: string;
  order: number;
  logs?: ExerciseLog[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExerciseLog {
  userId: Types.ObjectId;
  actualSets?: number;
  actualReps?: number;
  actualDurationSec?: number;
  actualWeight?: number;
  isCompleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExerciseLogSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    actualSets: {
      type: Number,
      required: false,
    },
    actualReps: {
      type: Number,
      required: false,
    },
    actualDurationSec: {
      type: Number,
      required: false,
    },
    actualWeight: {
      type: Number,
      required: false,
    },
    isCompleted: {
      type: Boolean,
      required: false,
    },
  },
  { timestamps: true }
);

const ExerciseSchema = new Schema(
  {
    exerciseId: {
      type: Types.ObjectId,
      ref: "ExerciseLibrary",
      required: true,
    },
    targetSets: {
      type: Number,
      required: false,
    },
    targetReps: {
      type: Number,
      required: false,
    },
    targetDurationSec: {
      type: Number,
      required: false,
    },
    targetWeight: {
      type: Number,
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    order: {
      type: Number,
      required: true,
    },
    logs: {
      type: [ExerciseLogSchema],
      required: false,
    },
  },
  { timestamps: true }
);

export interface Block {
  type: "single" | "superset" | "cluster" | "circuit";
  name?: string;
  description?: string;
  restBetweenExercisesSec?: number;
  restAfterBlockSec?: number;
  exercises: Exercise[];
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const BlockSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["single", "superset", "cluster", "circuit"],
      default: "single",
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    restBetweenExercisesSec: {
      type: Number,
      required: false,
    },
    restAfterBlockSec: {
      type: Number,
      required: false,
    },
    exercises: {
      type: [ExerciseSchema],
      default: [],
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export interface Workout {
  name: string;
  description?: string;
  category?: string[];
  difficulty?: "beginner" | "intermediate" | "advanced";
  duration?: number;
  blocks: Block[];
  accessType: ProfileAccess;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WeekDocument extends Document {
  weekNumber: number;
  workouts?: Workout[];
  meals?: Types.ObjectId[];
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const WorkoutSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    category: {
      type: [String],
      required: false,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: false,
    },
    duration: {
      type: Number,
      required: false,
    },
    blocks: {
      type: [BlockSchema],
      default: [],
      required: true,
    },
    accessType: {
      type: Number,
      enum: [ProfileAccess.Public, ProfileAccess.Private],
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const WeekSchema = new Schema(
  {
    weekNumber: { type: Number, required: true },
    workouts: [{ type: WorkoutSchema, required: false }],
    meals: [{ type: Types.ObjectId, ref: "Meal", required: false }],
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
  },
  { timestamps: true }
);

export const WeekModel = model<WeekDocument>("Week", WeekSchema);
