import { Schema, model, Document, Types } from "mongoose";

// Phase interface for program phases
export interface NutritionPhase {
  phaseNumber: number;
  name: string; // "Bulking Phase 1", "Cutting Phase", etc.
  description?: string;
  durationWeeks: number;
  phaseType: "bulking" | "cutting" | "maintenance" | "custom";

  // Calorie targets for this phase
  targetCaloriesPerDay?: number;
  targetWeightChange?: number; // pounds to gain/lose per week
  targetWeightChangeType?: "gain" | "lose" | "maintain";

  // Macro targets (optional, can be calculated from calories)
  targetProteinGrams?: number;
  targetCarbsGrams?: number;
  targetFatsGrams?: number;

  // Micro targets (optional)
  targetFiberGrams?: number;
  targetSugarGrams?: number;
  targetSodiumMg?: number;

  // Meal templates for this phase
  mealTemplates: Types.ObjectId[];

  // Phase timing
  startWeek?: number;
  endWeek?: number;
  isActive?: boolean;
}

// Main NutritionProgram interface
export interface NutritionProgramDocument extends Document {
  name: string;
  description?: string;
  category?: string; // "Weight Loss", "Muscle Gain", "Athletic Performance", etc.
  difficulty?: "beginner" | "intermediate" | "advanced";

  // Program structure
  totalDurationWeeks: number;
  phases: NutritionPhase[];
  hasPhases: boolean; // true if program is broken into phases

  // Ownership
  ownerType: "user" | "group";
  ownerId: Types.ObjectId; // User ID or Group ID
  createdBy?: Types.ObjectId; // User who created the program

  // Program settings
  isPublic?: boolean;
  isActive?: boolean;

  // Versioning (similar to workout templates)
  version: string;
  versionHistory: {
    version: string;
    changedAt: Date;
    changedBy: Types.ObjectId;
    changes: string[];
    changeReason?: string;
  }[];

  // Program metadata
  tags?: string[];
  estimatedCaloriesPerDay?: number; // Overall program target

  createdAt?: Date;
  updatedAt?: Date;
}

// Phase schema
const nutritionPhaseSchema = new Schema(
  {
    phaseNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500,
    },
    durationWeeks: {
      type: Number,
      required: true,
      min: 1,
      max: 52,
    },
    phaseType: {
      type: String,
      enum: ["bulking", "cutting", "maintenance", "custom"],
      required: true,
    },

    // Calorie targets
    targetCaloriesPerDay: {
      type: Number,
      required: false,
      min: 0,
      max: 10000,
    },
    targetWeightChange: {
      type: Number,
      required: false,
      min: -10,
      max: 10,
    },
    targetWeightChangeType: {
      type: String,
      enum: ["gain", "lose", "maintain"],
      required: false,
    },

    // Macro targets
    targetProteinGrams: {
      type: Number,
      required: false,
      min: 0,
      max: 1000,
    },
    targetCarbsGrams: {
      type: Number,
      required: false,
      min: 0,
      max: 2000,
    },
    targetFatsGrams: {
      type: Number,
      required: false,
      min: 0,
      max: 500,
    },

    // Micro targets
    targetFiberGrams: {
      type: Number,
      required: false,
      min: 0,
      max: 100,
    },
    targetSugarGrams: {
      type: Number,
      required: false,
      min: 0,
      max: 500,
    },
    targetSodiumMg: {
      type: Number,
      required: false,
      min: 0,
      max: 10000,
    },

    // Meal templates
    mealTemplates: [
      {
        type: Types.ObjectId,
        ref: "MealTemplate",
      },
    ],

    // Phase timing
    startWeek: {
      type: Number,
      required: false,
      min: 1,
    },
    endWeek: {
      type: Number,
      required: false,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

// Main NutritionProgram schema
const NutritionProgramSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      required: false,
      trim: true,
      maxlength: 50,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: false,
    },

    // Program structure
    totalDurationWeeks: {
      type: Number,
      required: true,
      min: 1,
      max: 104, // Max 2 years
    },
    phases: {
      type: [nutritionPhaseSchema],
      default: [],
    },
    hasPhases: {
      type: Boolean,
      default: false,
    },

    // Ownership
    ownerType: {
      type: String,
      enum: ["user", "group"],
      required: true,
    },
    ownerId: {
      type: Types.ObjectId,
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
    },

    // Program settings
    isPublic: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Versioning
    version: {
      type: String,
      required: true,
      default: "1.0.0",
    },
    versionHistory: [
      {
        version: {
          type: String,
          required: true,
        },
        changedAt: {
          type: Date,
          required: true,
          default: Date.now,
        },
        changedBy: {
          type: Types.ObjectId,
          ref: "User",
          required: true,
        },
        changes: [
          {
            type: String,
            required: true,
          },
        ],
        changeReason: {
          type: String,
          required: false,
        },
      },
    ],

    // Program metadata
    tags: {
      type: [String],
      default: [],
    },
    estimatedCaloriesPerDay: {
      type: Number,
      required: false,
      min: 0,
      max: 10000,
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
NutritionProgramSchema.index({ ownerType: 1, ownerId: 1 });
NutritionProgramSchema.index({ createdBy: 1 });
NutritionProgramSchema.index({ isPublic: 1 });
NutritionProgramSchema.index({ category: 1 });
NutritionProgramSchema.index({ difficulty: 1 });
NutritionProgramSchema.index({ tags: 1 });

// Validation middleware
NutritionProgramSchema.pre("validate", function (next) {
  // Validate that if hasPhases is true, phases array is not empty
  if (this.hasPhases && this.phases.length === 0) {
    return next(new Error("Program with phases must have at least one phase"));
  }

  // Validate that if hasPhases is false, phases array should be empty
  if (!this.hasPhases && this.phases.length > 0) {
    return next(
      new Error("Program without phases should not have phases defined")
    );
  }

  // Validate phase week ranges don't overlap
  if (this.hasPhases) {
    const sortedPhases = this.phases.sort(
      (a, b) => (Number(a.startWeek) || 0) - (Number(b.startWeek) || 0)
    );
    for (let i = 1; i < sortedPhases.length; i++) {
      const prevPhase = sortedPhases[i - 1];
      const currentPhase = sortedPhases[i];

      if (
        prevPhase.endWeek &&
        currentPhase.startWeek &&
        prevPhase.endWeek >= currentPhase.startWeek
      ) {
        return next(new Error("Phase week ranges cannot overlap"));
      }
    }
  }

  next();
});

export const NutritionProgramModel = model<NutritionProgramDocument>(
  "NutritionProgram",
  NutritionProgramSchema
);
