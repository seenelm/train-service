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
  createdAt?: Date;
  updatedAt?: Date;
}

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

export interface ExerciseLog {
  exerciseId: Types.ObjectId;
  actualSets?: number;
  actualReps?: number;
  actualDurationSec?: number;
  actualWeight?: number;
  isCompleted: boolean;
  order: number;
}

export interface BlockLog {
  actualRestBetweenExercisesSec?: number;
  actualRestAfterBlockSec?: number;
  exerciseLogs: ExerciseLog[];
  order: number;
  isCompleted: boolean;
}

const ExerciseLogSchema = new Schema(
  {
    exerciseId: {
      type: Types.ObjectId,
      ref: "ExerciseLibrary",
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
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const BlockLogSchema = new Schema(
  {
    actualRestBetweenExercisesSec: {
      type: Number,
      required: false,
    },
    actualRestAfterBlockSec: {
      type: Number,
      required: false,
    },
    exerciseLogs: {
      type: [ExerciseLogSchema],
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

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
  startDate: Date;
  endDate: Date;
  workoutLogs?: WorkoutLog[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkoutLog {
  userId: Types.ObjectId;
  workoutId: Types.ObjectId;
  blockLogs: BlockLog[];
  actualDuration: number;
  actualStartDate: Date;
  actualEndDate: Date;
  isCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const WorkoutLogSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    workoutId: {
      type: Types.ObjectId,
      ref: "Workout",
      required: true,
    },
    blockLogs: {
      type: [BlockLogSchema],
      required: true,
    },
    actualDuration: {
      type: Number,
      required: true,
    },
    actualStartDate: {
      type: Date,
      required: true,
    },
    actualEndDate: {
      type: Date,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

export interface WeekDocument extends Document {
  weekNumber: number;
  workouts?: Workout[];
  meals?: Types.ObjectId[];
  notes?: Notes[];
  startDate: Date;
  endDate: Date;
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    workoutLogs: {
      type: [WorkoutLogSchema],
      required: false,
    },
  },
  { timestamps: true }
);

export interface Notes {
  title: string;
  content: string;
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotesSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const WeekSchema = new Schema(
  {
    weekNumber: { type: Number, required: true },
    workouts: [{ type: WorkoutSchema, required: false }],
    meals: [{ type: Types.ObjectId, ref: "Meal", required: false }],
    notes: [{ type: NotesSchema, required: false }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const WeekModel = model<WeekDocument>("Week", WeekSchema);
