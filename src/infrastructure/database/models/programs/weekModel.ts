import { Schema, model, Document, Types } from "mongoose";
import {
  ProfileAccess,
  BlockType,
  WorkoutDifficulty,
  MeasurementType,
} from "@seenelm/train-core";

export interface Exercise {
  name: string;
  rest?: number;
  targetReps?: number;
  targetDurationSec?: number;
  targetWeight?: number;
  targetDistance?: number;
  notes?: string;
  order: number;
  measurementType: MeasurementType;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    rest: {
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
    targetDistance: {
      type: Number,
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    measurementType: {
      type: String,
      enum: Object.values(MeasurementType),
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export interface Block {
  type: BlockType;
  name?: string;
  targetSets?: number;
  description?: string;
  rest?: number;
  exercises: Exercise[];
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExerciseSnapshot {
  name: string;
  rest?: number;
  targetReps?: number;
  targetDurationSec?: number;
  targetWeight?: number;
  targetDistance?: number;
  measurementType: MeasurementType;
  notes?: string;
  order: number;
}

const ExerciseSnapshotSchema = new Schema(
  {
    name: { type: String, required: true },
    rest: { type: Number, required: false },
    targetReps: { type: Number, required: false },
    targetDurationSec: { type: Number, required: false },
    targetWeight: { type: Number, required: false },
    targetDistance: { type: Number, required: false },
    measurementType: {
      type: String,
      enum: Object.values(MeasurementType),
      required: true,
    },
    notes: { type: String, required: false },
    order: { type: Number, required: true },
  },
  { _id: false }
);

export interface ExerciseLog {
  name: string;
  actualRest?: number;
  actualReps?: number;
  actualDurationSec?: number;
  actualWeight?: number;
  actualDistance?: number;
  isCompleted: boolean;
  order: number;
}

export interface BlockSnapshot {
  type: BlockType;
  name?: string;
  targetSets?: number;
  description?: string;
  rest?: number;
  exerciseSnapshot: ExerciseSnapshot[];
  order: number;
}

const BlockSnapshotSchema = new Schema(
  {
    type: { type: String, enum: Object.values(BlockType), required: true },
    name: { type: String, required: false },
    description: { type: String, required: false },
    rest: { type: Number, required: false },
    targetSets: { type: Number, required: false },
    exerciseSnapshot: { type: [ExerciseSnapshotSchema], required: true },
    order: { type: Number, required: true },
  },
  { _id: false }
);

export interface BlockLog {
  actualRest?: number;
  actualSets?: number;
  exerciseLogs: ExerciseLog[];
  order: number;
  isCompleted: boolean;
}

const ExerciseLogSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    actualRest: {
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
    actualDistance: {
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
    actualRest: {
      type: Number,
      required: false,
    },
    actualSets: {
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
      enum: Object.values(BlockType),
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
    rest: {
      type: Number,
      required: false,
    },
    targetSets: {
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
  _id?: Types.ObjectId;
  versionId: number;
  name: string;
  description?: string;
  category?: string[];
  difficulty?: WorkoutDifficulty;
  duration?: number;
  blocks?: Block[];
  accessType: ProfileAccess;
  createdBy: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  workoutLogs?: WorkoutLog[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkoutSnapshot {
  name: string;
  description?: string;
  category?: string[];
  difficulty?: WorkoutDifficulty;
  duration?: number;
  blockSnapshot: BlockSnapshot[];
  accessType: ProfileAccess;
  createdBy: Types.ObjectId;
  startDate: Date;
  endDate: Date;
}

const WorkoutSnapshotSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: false },
    category: { type: [String], required: false },
    difficulty: {
      type: String,
      enum: Object.values(WorkoutDifficulty),
      required: false,
    },
    duration: { type: Number, required: false },
    blockSnapshot: { type: [BlockSnapshotSchema], required: true },
    accessType: {
      type: Number,
      enum: [ProfileAccess.Public, ProfileAccess.Private],
      required: true,
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { _id: false }
);

export interface WorkoutLog {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  workoutId: Types.ObjectId;
  versionId: number;
  workoutSnapshot: WorkoutSnapshot;
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
    versionId: {
      type: Number,
      required: true,
    },
    workoutSnapshot: {
      type: WorkoutSnapshotSchema,
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
  name?: string;
  description?: string;
  weekNumber: number;
  workouts: Workout[];
  meals?: Types.ObjectId[];
  notes?: Notes[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const WorkoutSchema = new Schema(
  {
    versionId: {
      type: Number,
      required: true,
      default: 1,
    },
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
      enum: Object.values(WorkoutDifficulty),
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
  _id?: Types.ObjectId;
  createdBy: Types.ObjectId;
  title: string;
  content: string;
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotesSchema = new Schema(
  {
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const WeekSchema = new Schema(
  {
    name: { type: String, required: false },
    description: { type: String, required: false },
    weekNumber: { type: Number, required: true },
    workouts: [{ type: WorkoutSchema, required: true, default: [] }],
    meals: [{ type: Types.ObjectId, ref: "Meal", required: false }],
    notes: [{ type: NotesSchema, required: false }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

export const WeekModel = model<WeekDocument>("Week", WeekSchema);
