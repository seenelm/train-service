import { z } from "zod";
import {
  ProfileAccess,
  WorkoutDifficulty,
  BlockType,
  Unit,
} from "@seenelm/train-core";
import { ValidationErrorMessage } from "../../common/enums.js";

const phaseSchema = z.object({
  name: z.string().transform((val) => val.trim()),
  startWeek: z.number().int(),
  endWeek: z.number().int(),
});

const exerciseSchema = z.object({
  name: z.string(),
  targetSets: z.number().int().optional(),
  targetReps: z.number().int().optional(),
  targetDurationSec: z.number().int().optional(),
  targetWeight: z.number().optional(),
  notes: z.string().optional(),
  order: z.number().int(),
});

const blockSchema = z.object({
  type: z.enum(Object.values(BlockType) as [string, ...string[]]),
  name: z.string().optional(),
  description: z.string().optional(),
  restBetweenExercisesSec: z.number().int().optional(),
  restAfterBlockSec: z.number().int().optional(),
  exercises: z.array(exerciseSchema),
  order: z.number().int(),
});

const exerciseLogSchema = z.object({
  name: z.string(),
  actualSets: z.number().int().optional(),
  actualReps: z.number().int().optional(),
  actualDurationSec: z.number().int().optional(),
  actualWeight: z.number().int().optional(),
  isCompleted: z.boolean(),
  order: z.number().int().min(1),
});

export const blockLogSchema = z.object({
  actualRestBetweenExercisesSec: z.number().int().optional(),
  actualRestAfterBlockSec: z.number().int().optional(),
  exerciseLogs: z.array(exerciseLogSchema),
  order: z.number().int().min(1),
  isCompleted: z.boolean(),
});

export const programRequestSchema = z.object({
  name: z.string().transform((val) => val.trim()),
  types: z
    .array(z.string())
    .optional()
    .transform((val) => val?.map((type) => type.trim())),
  numWeeks: z.number().int(),
  hasNutritionProgram: z.boolean().optional(),
  phases: z.array(phaseSchema).optional(),
  accessType: z.union([
    z.literal(ProfileAccess.Public),
    z.literal(ProfileAccess.Private),
  ]),
  admins: z.array(z.string()),
  members: z.array(z.string()).optional(),
  createdBy: z.string(),
});

export const workoutRequestSchema = z.object({
  name: z.string().transform((val) => val.trim()),
  description: z
    .string()
    .optional()
    .transform((val) => val?.trim()),
  category: z.array(z.string()).optional(),
  difficulty: z
    .enum(Object.values(WorkoutDifficulty) as [string, ...string[]])
    .optional(),
  duration: z.number().int().optional(),
  blocks: z.array(blockSchema).optional(),
  accessType: z.union([
    z.literal(ProfileAccess.Public),
    z.literal(ProfileAccess.Private),
  ]),
  createdBy: z.string(),
  startDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
  endDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
});

const macrosSchema = z.object({
  protein: z.number().int(),
  carbs: z.number().int(),
  fats: z.number().int(),
});

const ingredientSchema = z.object({
  name: z.string().transform((val) => val.trim()),
  portion: z.object({
    amount: z.number().int(),
    unit: z.enum(Object.values(Unit) as [string, ...string[]]),
  }),
});

export const mealRequestSchema = z.object({
  createdBy: z.string(),
  mealName: z.string().transform((val) => val.trim()),
  macros: macrosSchema.optional(),
  ingredients: z.array(ingredientSchema).optional(),
  instructions: z.string().optional(),
  startDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
  endDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
});

export const workoutLogRequestSchema = z.object({
  userId: z.string(),
  workoutId: z.string(),
  versionId: z.number().int(),
  workoutSnapshot: z.object({
    name: z.string().transform((val) => val.trim()),
    description: z.string().optional(),
    category: z.array(z.string().min(1, "Category cannot be empty")).optional(),
    difficulty: z
      .enum(Object.values(WorkoutDifficulty) as [string, ...string[]])
      .optional(),
    duration: z.number().int().optional(),
    blockSnapshot: z.array(blockSchema),
    accessType: z.enum(ProfileAccess),
    createdBy: z.string(),
    startDate: z.date(),
    endDate: z.date(),
  }),
  blockLogs: z.array(blockLogSchema).optional(),
  actualDuration: z.number().int(),
  actualStartDate: z.date(),
  actualEndDate: z.date(),
  isCompleted: z.boolean(),
});

export const mealLogRequestSchema = z.object({
  versionId: z.number().int(),
  userId: z.string(),
  mealId: z.string(),
  mealSnapshot: z.object({
    createdBy: z.string(),
    mealName: z.string().transform((val) => val.trim()),
    macrosSnapshot: z.object({
      protein: z.number().int(),
      carbs: z.number().int(),
      fats: z.number().int(),
    }),
    ingredientSnapshot: z.array(
      z.object({
        name: z.string().transform((val) => val.trim()),
        portionSnapshot: z.object({
          amount: z.number().int(),
          unit: z.enum(Object.values(Unit) as [string, ...string[]]),
        }),
      })
    ),
    instructions: z.string().optional(),
    startDate: z.date(),
    endDate: z.date(),
  }),
  actualMacros: z
    .object({
      protein: z.number().int(),
      carbs: z.number().int(),
      fats: z.number().int(),
    })
    .optional(),
  actualIngredients: z
    .array(
      z.object({
        name: z.string().transform((val) => val.trim()),
        portion: z.object({
          amount: z.number().int(),
          unit: z.enum(Object.values(Unit) as [string, ...string[]]),
        }),
      })
    )
    .optional(),
  notes: z.string().optional(),
  isCompleted: z.boolean(),
  actualStartDate: z.date(),
  actualEndDate: z.date(),
});

export const noteRequestSchema = z.object({
  title: z.string().transform((val) => val.trim()),
  content: z.string().transform((val) => val.trim()),
  startDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
  endDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
});
