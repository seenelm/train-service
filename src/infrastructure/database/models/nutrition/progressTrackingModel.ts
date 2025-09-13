import { Schema, model, Document, Types } from "mongoose";

// Progress photo interface
export interface ProgressPhoto {
  photoUrl: string;
  photoType: "front" | "side" | "back" | "other";
  takenAt: Date;
  notes?: string;
  isPublic?: boolean; // Whether user wants to share this photo
}

// Weekly progress entry
export interface WeeklyProgress {
  weekNumber: number;
  weight?: number; // Current weight in pounds
  bodyFatPercentage?: number;
  muscleMass?: number;
  notes?: string; // User's weekly notes
  photos?: ProgressPhoto[];
  submittedAt: Date;
  isCompleted: boolean;
}

// Nutrition program progress interface
export interface ProgressTrackingDocument extends Document {
  userId: Types.ObjectId;
  nutritionProgramId: Types.ObjectId;
  phaseId?: Types.ObjectId; // If tracking specific phase

  // Program start data
  startWeight: number; // Starting weight in pounds
  startBodyFatPercentage?: number;
  startMuscleMass?: number;
  startPhotos: ProgressPhoto[]; // Initial progress photos

  // Program end data
  endWeight?: number; // Final weight in pounds
  endBodyFatPercentage?: number;
  endMuscleMass?: number;
  endPhotos?: ProgressPhoto[]; // Final progress photos

  // Weekly progress tracking
  weeklyProgress: WeeklyProgress[];

  // Program status
  status: "in_progress" | "completed" | "paused" | "cancelled";
  startDate: Date;
  endDate?: Date;
  currentWeek?: number; // Current week in the program

  // Goals and targets
  targetWeight?: number; // Target weight for the program
  targetWeightChange?: number; // Pounds to gain/lose
  targetWeightChangeType?: "gain" | "lose" | "maintain";

  // Progress metrics
  totalWeightChange?: number; // Current weight - start weight
  averageWeeklyWeightChange?: number; // Average weight change per week
  programCompletionPercentage?: number; // How much of the program is completed

  // Coach feedback (for group programs)
  coachNotes?: string;
  coachRating?: number; // 1-5 scale
  lastCoachReview?: Date;

  // User feedback
  userRating?: number; // 1-5 scale for program satisfaction
  userNotes?: string;

  // Metadata
  deviceInfo?: {
    platform?: string;
    version?: string;
    deviceId?: string;
  };

  createdAt?: Date;
  updatedAt?: Date;
}

// Progress photo schema
const progressPhotoSchema = new Schema(
  {
    photoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    photoType: {
      type: String,
      enum: ["front", "side", "back", "other"],
      required: true,
    },
    takenAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// Weekly progress schema
const weeklyProgressSchema = new Schema(
  {
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 104, // Max 2 years
    },
    weight: {
      type: Number,
      required: false,
      min: 0,
      max: 1000, // Max 1000 pounds
    },
    bodyFatPercentage: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },
    muscleMass: {
      type: Number,
      required: false,
      min: 0,
      max: 1000,
    },
    notes: {
      type: String,
      required: false,
      trim: true,
      maxlength: 2000,
    },
    photos: {
      type: [progressPhotoSchema],
      default: [],
    },
    submittedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// Main ProgressTracking schema
const ProgressTrackingSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    nutritionProgramId: {
      type: Types.ObjectId,
      ref: "NutritionProgram",
      required: true,
    },
    phaseId: {
      type: Types.ObjectId,
      required: false,
    },

    // Program start data
    startWeight: {
      type: Number,
      required: true,
      min: 0,
      max: 1000,
    },
    startBodyFatPercentage: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },
    startMuscleMass: {
      type: Number,
      required: false,
      min: 0,
      max: 1000,
    },
    startPhotos: {
      type: [progressPhotoSchema],
      default: [],
    },

    // Program end data
    endWeight: {
      type: Number,
      required: false,
      min: 0,
      max: 1000,
    },
    endBodyFatPercentage: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },
    endMuscleMass: {
      type: Number,
      required: false,
      min: 0,
      max: 1000,
    },
    endPhotos: {
      type: [progressPhotoSchema],
      default: [],
    },

    // Weekly progress tracking
    weeklyProgress: {
      type: [weeklyProgressSchema],
      default: [],
    },

    // Program status
    status: {
      type: String,
      enum: ["in_progress", "completed", "paused", "cancelled"],
      default: "in_progress",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: false,
    },
    currentWeek: {
      type: Number,
      required: false,
      min: 1,
      max: 104,
    },

    // Goals and targets
    targetWeight: {
      type: Number,
      required: false,
      min: 0,
      max: 1000,
    },
    targetWeightChange: {
      type: Number,
      required: false,
      min: -100,
      max: 100,
    },
    targetWeightChangeType: {
      type: String,
      enum: ["gain", "lose", "maintain"],
      required: false,
    },

    // Progress metrics (calculated)
    totalWeightChange: {
      type: Number,
      required: false,
    },
    averageWeeklyWeightChange: {
      type: Number,
      required: false,
    },
    programCompletionPercentage: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },

    // Coach feedback
    coachNotes: {
      type: String,
      required: false,
      trim: true,
      maxlength: 2000,
    },
    coachRating: {
      type: Number,
      required: false,
      min: 1,
      max: 5,
    },
    lastCoachReview: {
      type: Date,
      required: false,
    },

    // User feedback
    userRating: {
      type: Number,
      required: false,
      min: 1,
      max: 5,
    },
    userNotes: {
      type: String,
      required: false,
      trim: true,
      maxlength: 2000,
    },

    // Metadata
    deviceInfo: {
      platform: {
        type: String,
        required: false,
        trim: true,
      },
      version: {
        type: String,
        required: false,
        trim: true,
      },
      deviceId: {
        type: String,
        required: false,
        trim: true,
      },
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
ProgressTrackingSchema.index({ userId: 1, startDate: -1 });
ProgressTrackingSchema.index({ nutritionProgramId: 1 });
ProgressTrackingSchema.index({ phaseId: 1 });
ProgressTrackingSchema.index({ status: 1 });
ProgressTrackingSchema.index({ startDate: -1 });
ProgressTrackingSchema.index({ "weeklyProgress.weekNumber": 1 });

// Pre-save middleware to calculate progress metrics
ProgressTrackingSchema.pre("save", function (next) {
  // Calculate total weight change
  if (this.endWeight !== undefined && this.endWeight !== null) {
    this.totalWeightChange = this.endWeight - this.startWeight;
  } else if (this.weeklyProgress.length > 0) {
    const latestWeight =
      this.weeklyProgress[this.weeklyProgress.length - 1].weight;
    if (latestWeight !== undefined && latestWeight !== null) {
      this.totalWeightChange = latestWeight - this.startWeight;
    }
  }

  // Calculate average weekly weight change
  if (this.weeklyProgress.length > 1) {
    const weightChanges = [];
    for (let i = 1; i < this.weeklyProgress.length; i++) {
      const prevWeight = this.weeklyProgress[i - 1].weight;
      const currentWeight = this.weeklyProgress[i].weight;
      if (
        prevWeight !== undefined &&
        prevWeight !== null &&
        currentWeight !== undefined &&
        currentWeight !== null
      ) {
        weightChanges.push(currentWeight - prevWeight);
      }
    }

    if (weightChanges.length > 0) {
      this.averageWeeklyWeightChange =
        weightChanges.reduce((sum, change) => sum + change, 0) /
        weightChanges.length;
    }
  }

  // Calculate program completion percentage
  if (this.currentWeek !== undefined && this.currentWeek !== null) {
    // Get program duration from nutrition program
    // For now, we'll use a placeholder calculation
    this.programCompletionPercentage = Math.min(
      (this.currentWeek / 12) * 100,
      100
    );
  }

  next();
});

export const ProgressTrackingModel = model<ProgressTrackingDocument>(
  "ProgressTracking",
  ProgressTrackingSchema
);
