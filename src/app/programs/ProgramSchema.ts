import { z } from "zod";
import {
  ProfileAccess,
  WorkoutDifficulty,
  BlockType,
  Unit,
  MeasurementType,
} from "@seenelm/train-core";

const phaseSchema = z.object({
  name: z.string().transform((val) => val.trim()),
  startWeek: z.number().int(),
  endWeek: z.number().int(),
});

const exerciseSchema = z.object({
  name: z.string(),
  rest: z.number().int().optional(),
  targetReps: z.number().int().optional(),
  targetDurationSec: z.number().int().optional(),
  targetWeight: z.number().optional(),
  targetDistance: z.number().optional(),
  measurementType: z.enum(
    Object.values(MeasurementType) as [string, ...string[]]
  ),
  notes: z.string().optional(),
  order: z.number().int(),
});

const blockSchema = z.object({
  type: z.enum(Object.values(BlockType) as [string, ...string[]]),
  name: z.string().optional(),
  description: z.string().optional(),
  rest: z.number().int().optional(),
  targetSets: z.number().int().optional(),
  exercises: z.array(exerciseSchema),
  order: z.number().int(),
});

const exerciseLogSchema = z.object({
  name: z.string(),
  actualRest: z.number().int().optional(),
  actualReps: z.number().int().optional(),
  actualDurationSec: z.number().int().optional(),
  actualWeight: z.number().int().optional(),
  actualDistance: z.number().int().optional(),
  isCompleted: z.boolean(),
  order: z.number().int(),
});

export const blockLogSchema = z.object({
  actualRest: z.number().int().optional(),
  actualSets: z.number().int().optional(),
  exerciseLogs: z.array(exerciseLogSchema),
  order: z.number().int(),
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

const ingredientSnapshotSchema = z.object({
  name: z.string().transform((val) => val.trim()),
  portionSnapshot: z.object({
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

export const mealSnapshotSchema = z.object({
  createdBy: z.string(),
  mealName: z.string().transform((val) => val.trim()),
  macrosSnapshot: macrosSchema.optional(),
  ingredientSnapshot: z.array(ingredientSnapshotSchema).optional(),
  instructions: z.string().optional(),
  startDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
  endDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
});

export const workoutSnapshotSchema = z.object({
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
  blocks: z.array(blockSchema),
  accessType: z.union([
    z.literal(ProfileAccess.Public),
    z.literal(ProfileAccess.Private),
  ]),
  createdBy: z.string(),
  startDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
  endDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
});

export const workoutLogRequestSchema = z.object({
  userId: z.string(),
  workoutId: z.string(),
  versionId: z.number().int(),
  workoutSnapshot: workoutSnapshotSchema,
  blockLogs: z.array(blockLogSchema).optional(),
  actualDuration: z.number().int(),
  actualStartDate: z.union([
    z.date(),
    z.string().transform((val) => new Date(val)),
  ]),
  actualEndDate: z.union([
    z.date(),
    z.string().transform((val) => new Date(val)),
  ]),
  isCompleted: z.boolean(),
});

export const mealLogRequestSchema = z.object({
  versionId: z.number().int(),
  userId: z.string(),
  mealId: z.string(),
  mealSnapshot: mealSnapshotSchema,
  actualMacros: macrosSchema.optional(),
  actualIngredients: z.array(ingredientSchema).optional(),
  notes: z.string().optional(),
  isCompleted: z.boolean(),
  actualStartDate: z.union([
    z.date(),
    z.string().transform((val) => new Date(val)),
  ]),
  actualEndDate: z.union([
    z.date(),
    z.string().transform((val) => new Date(val)),
  ]),
});

export const noteRequestSchema = z.object({
  createdBy: z.string(),
  title: z.string().transform((val) => val.trim()),
  content: z.string().transform((val) => val.trim()),
  startDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
  endDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
});

export const weekRequestSchema = z.object({
  name: z
    .string()
    .transform((val) => val.trim())
    .optional(),
  description: z
    .string()
    .transform((val) => val.trim())
    .optional(),
  weekNumber: z.number().int(),
  startDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
  endDate: z.union([z.date(), z.string().transform((val) => new Date(val))]),
});
