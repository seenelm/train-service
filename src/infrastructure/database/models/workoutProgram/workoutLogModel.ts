import { Schema, model, Document, Types } from "mongoose";

export interface Set {
  setNumber: number;
  actualReps?: number;
  actualWeight?: number;
  actualDurationSec?: number;
  restTimeSec?: number; // TODO: Do I need this?
  notes?: string;
  isCompleted?: boolean;
  completedAt?: Date;
}

export interface ExerciseLog {
  exerciseId: Types.ObjectId;
  exerciseName?: string; // Cached for performance
  targetSets?: number;
  targetReps?: number;
  targetWeight?: number;
  targetDurationSec?: number;
  sets: Set[];
  totalVolume?: number; // Calculated: sets * reps * weight
  personalRecord?: boolean;
  notes?: string;
  order?: number;
}

export interface BlockLog {
  type: "single" | "superset" | "cluster" | "circuit";
  name?: string;
  exercises: ExerciseLog[];

  // Planned rest times (from template)
  plannedRestBetweenExercisesSec?: number;
  plannedRestAfterBlockSec?: number;

  // Actual rest times (what user did)
  actualRestBetweenExercisesSec?: number;
  actualRestAfterBlockSec?: number;

  order?: number;
  isCompleted?: boolean;
  completedAt?: Date;
  totalDurationSec?: number;
}

export interface WorkoutLogDocument extends Document {
  userId: Types.ObjectId;
  workoutProgramId?: Types.ObjectId; // Optional if free workout
  workoutTemplateId?: Types.ObjectId; // Optional if custom workout
  weekNumber?: number; // If part of a program
  workoutName: string;
  exerciseType?: "strength" | "cardio" | "hybrid" | "flexibility" | "sports";
  status: "in_progress" | "completed" | "paused" | "cancelled";

  // Template versioning (for coach edits)
  templateVersion?: string; // Version of template when workout started
  templateSnapshot?: any; // Complete template data at workout start

  // Timing
  startedAt: Date;
  completedAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
  totalDurationSec?: number;

  // Workout data
  blocks: BlockLog[];

  // Performance metrics
  totalVolume?: number; // Total weight lifted
  totalReps?: number; // Total repetitions

  // User feedback
  overallNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Set schema
const setSchema = new Schema(
  {
    setNumber: {
      type: Number,
      required: true,
    },
    actualReps: {
      type: Number,
      required: false,
    },
    actualWeight: {
      type: Number,
      required: false,
    },
    actualDurationSec: {
      type: Number,
      required: false,
    },
    restTimeSec: {
      type: Number,
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      required: false,
    },
  },
  { _id: false }
);

// Exercise log schema
const exerciseLogSchema = new Schema(
  {
    exerciseId: {
      type: Types.ObjectId,
      ref: "ExerciseLibrary",
      required: true,
    },
    exerciseName: {
      type: String,
      required: false,
    },
    targetSets: {
      type: Number,
      required: false,
    },
    targetReps: {
      type: Number,
      required: false,
    },
    targetWeight: {
      type: Number,
      required: false,
    },
    targetDurationSec: {
      type: Number,
      required: false,
    },
    sets: {
      type: [setSchema],
      default: [],
    },
    totalVolume: {
      type: Number,
      required: false,
    },
    personalRecord: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      required: false,
    },
    order: {
      type: Number,
      required: false,
    },
  },
  { _id: false }
);

// Block log schema
const blockLogSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["single", "superset", "cluster", "circuit"],
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
    exercises: {
      type: [exerciseLogSchema],
      default: [],
    },

    // Planned rest times (from template)
    plannedRestBetweenExercisesSec: {
      type: Number,
      required: false,
    },
    plannedRestAfterBlockSec: {
      type: Number,
      required: false,
    },

    // Actual rest times (what user did)
    actualRestBetweenExercisesSec: {
      type: Number,
      required: false,
    },
    actualRestAfterBlockSec: {
      type: Number,
      required: false,
    },
    order: {
      type: Number,
      required: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      required: false,
    },
    totalDurationSec: {
      type: Number,
      required: false,
    },
  },
  { _id: false }
);

// Main WorkoutLog schema
const WorkoutLogSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    workoutProgramId: {
      type: Types.ObjectId,
      ref: "WorkoutProgram",
      required: false,
    },
    workoutTemplateId: {
      type: Types.ObjectId,
      ref: "WorkoutTemplate",
      required: false,
    },
    weekNumber: {
      type: Number,
      required: false,
    },
    workoutName: {
      type: String,
      required: true,
    },
    exerciseType: {
      type: String,
      enum: ["strength", "cardio", "hybrid", "flexibility", "sports"],
      required: false,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed", "paused", "cancelled"],
      default: "in_progress",
      required: true,
    },

    // Template versioning (for coach edits)
    templateVersion: {
      type: String,
      required: false,
    },
    templateSnapshot: {
      type: Schema.Types.Mixed,
      required: false,
    },

    // Timing
    startedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    completedAt: {
      type: Date,
      required: false,
    },
    pausedAt: {
      type: Date,
      required: false,
    },
    resumedAt: {
      type: Date,
      required: false,
    },
    totalDurationSec: {
      type: Number,
      required: false,
    },

    // Workout data
    blocks: {
      type: [blockLogSchema],
      default: [],
    },

    // Performance metrics
    totalVolume: {
      type: Number,
      required: false,
    },
    totalReps: {
      type: Number,
      required: false,
      min: 0,
    },

    // User feedback
    overallNotes: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export const WorkoutLogModel = model<WorkoutLogDocument>(
  "WorkoutLog",
  WorkoutLogSchema
);
