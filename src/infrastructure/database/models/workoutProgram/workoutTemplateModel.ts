import { Schema, model, Document, Types } from "mongoose";

export interface Exercise {
  exerciseId: Types.ObjectId;
  targetSets?: number;
  targetReps?: number;
  targetDurationSec?: number;
  targetWeight?: number;
  notes?: string;
  order?: number; // For exercise ordering within a block
}

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
  },
  { _id: false }
);

export interface Block {
  type: "single" | "superset" | "cluster" | "circuit";
  name?: string;
  description?: string;
  restBetweenExercisesSec?: number;
  restAfterBlockSec?: number;
  exercises: Exercise[];
  order?: number; // For block ordering within workout
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

// Version history interface
export interface TemplateVersionHistory {
  version: string;
  changedAt: Date;
  changedBy: Types.ObjectId;
  changes: string[]; // ["Updated rest times", "Added new exercise", "Removed exercise"]
  changeReason?: string; // Optional reason for the change
}

export interface WorkoutTemplateDocument extends Document {
  name: string;
  description?: string;
  category?: string; // "Upper body", "Lower body", "Full body", etc.
  difficulty?: "beginner" | "intermediate" | "advanced";
  estimatedDurationMin?: number;
  blocks: Block[];
  tags?: string[];
  isPublic?: boolean;
  createdBy?: Types.ObjectId;

  // Versioning fields
  version: string; // "1.0.0", "1.1.0", "2.0.0"
  isActive: boolean; // Only latest version is active
  versionHistory: TemplateVersionHistory[];
  previousVersions?: Types.ObjectId[]; // References to archived versions
  parentTemplateId?: Types.ObjectId; // Reference to original template (for versions)

  createdAt?: Date;
  updatedAt?: Date;
}

const WorkoutTemplateSchema = new Schema(
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

    // Versioning fields
    version: {
      type: String,
      required: true,
      default: "1.0.0",
    },
    isActive: {
      type: Boolean,
      default: true,
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
    previousVersions: [
      {
        type: Types.ObjectId,
        ref: "WorkoutTemplate",
      },
    ],
    parentTemplateId: {
      type: Types.ObjectId,
      ref: "WorkoutTemplate",
      required: false,
    },
  },
  { timestamps: true }
);

export const WorkoutTemplateModel = model<WorkoutTemplateDocument>(
  "WorkoutTemplate",
  WorkoutTemplateSchema
);

// Utility functions for version management
export class TemplateVersionManager {
  /**
   * Increment version number (1.0.0 -> 1.1.0, 1.9.0 -> 2.0.0)
   */
  static incrementVersion(
    currentVersion: string,
    changeType: "major" | "minor" | "patch" = "minor"
  ): string {
    const [major, minor, patch] = currentVersion.split(".").map(Number);

    switch (changeType) {
      case "major":
        return `${major + 1}.0.0`;
      case "minor":
        return `${major}.${minor + 1}.0`;
      case "patch":
        return `${major}.${minor}.${patch + 1}`;
      default:
        return `${major}.${minor + 1}.0`;
    }
  }

  /**
   * Create a new version of a template
   */
  static async createNewVersion(
    templateId: string,
    updates: Partial<WorkoutTemplateDocument>,
    changedBy: Types.ObjectId,
    changes: string[],
    changeReason?: string
  ): Promise<WorkoutTemplateDocument> {
    const originalTemplate = await WorkoutTemplateModel.findById(templateId);
    if (!originalTemplate) {
      throw new Error("Template not found");
    }

    // Archive current version
    await WorkoutTemplateModel.findByIdAndUpdate(templateId, {
      isActive: false,
      versionHistory: [
        ...originalTemplate.versionHistory,
        {
          version: originalTemplate.version,
          changedAt: new Date(),
          changedBy,
          changes: ["Archived for new version"],
          changeReason: "Superseded by new version",
        },
      ],
    });

    // Create new version
    const newVersion = this.incrementVersion(originalTemplate.version);
    const newTemplate = new WorkoutTemplateModel({
      ...originalTemplate.toObject(),
      ...updates,
      _id: new Types.ObjectId(), // Generate new ID
      version: newVersion,
      isActive: true,
      parentTemplateId: originalTemplate._id,
      versionHistory: [
        {
          version: newVersion,
          changedAt: new Date(),
          changedBy,
          changes,
          changeReason,
        },
      ],
      previousVersions: [
        ...(originalTemplate.previousVersions || []),
        originalTemplate._id,
      ],
    });

    return await newTemplate.save();
  }

  /**
   * Get active version of a template
   */
  static async getActiveVersion(
    templateId: string
  ): Promise<WorkoutTemplateDocument | null> {
    return await WorkoutTemplateModel.findOne({
      $or: [
        { _id: templateId, isActive: true },
        { parentTemplateId: templateId, isActive: true },
      ],
    });
  }

  /**
   * Get all versions of a template
   */
  static async getAllVersions(
    templateId: string
  ): Promise<WorkoutTemplateDocument[]> {
    return await WorkoutTemplateModel.find({
      $or: [{ _id: templateId }, { parentTemplateId: templateId }],
    }).sort({ version: -1 });
  }
}

// Note: Version history should be managed in the service layer
// to avoid TypeScript issues with ObjectId types in middleware
