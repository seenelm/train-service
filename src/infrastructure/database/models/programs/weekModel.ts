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
  logs: ExerciseLog[];
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

const exerciseLogSchema = new Schema(
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

const exerciseSchema = new Schema(
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
      required: false,
    },
    logs: {
      type: [exerciseLogSchema],
      default: [],
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
  order: number; // For block ordering within workout
}

const blockSchema = new Schema(
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
      type: [exerciseSchema],
      default: [],
    },
    order: {
      type: Number,
      required: false,
    },
  },
  { _id: false }
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
  workouts: Workout[];
  meals: Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
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
      type: String,
      required: false,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: false,
    },
    estimatedDurationMin: {
      type: Number,
      required: false,
    },
    blocks: {
      type: [blockSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

const WeekSchema = new Schema(
  {
    weekNumber: { type: Number, required: true },
    workouts: [{ type: WorkoutSchema, default: [] }],
    meals: [{ type: Types.ObjectId, ref: "Meal", default: [] }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const WeekModel = model<WeekDocument>("Week", WeekSchema);
