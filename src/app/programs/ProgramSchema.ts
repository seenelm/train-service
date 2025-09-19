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

// Exercise schema for workout validation
const exerciseSchema = z.object({
  exerciseId: z.string({
    error: (issue) =>
      issue.input === undefined
        ? ValidationErrorMessage.EXERCISE_ID_REQUIRED
        : ValidationErrorMessage.EXERCISE_ID_INVALID_FORMAT,
  }),
  targetSets: z.number().int().optional(),
  targetReps: z.number().int().optional(),
  targetDurationSec: z.number().int().optional(),
  targetWeight: z.number().optional(),
  notes: z.string().optional(),
  order: z.number().int().min(1),
});

// Block schema for workout validation
const blockSchema = z.object({
  type: z.enum(Object.values(BlockType) as [string, ...string[]]),
  name: z.string().optional(),
  description: z.string().optional(),
  restBetweenExercisesSec: z.number().int().optional(),
  restAfterBlockSec: z.number().int().optional(),
  exercises: z
    .array(exerciseSchema)
    .min(1, "Block must have at least one exercise"),
  order: z.number().int().min(1),
});

export const createProgramSchema = z.object({
  name: z
    .string()
    .min(1, ValidationErrorMessage.PROGRAM_NAME_REQUIRED)
    .transform((val) => val.trim()),

  types: z
    .array(z.string().min(1, "Program type cannot be empty"))
    .optional()
    .transform((val) =>
      val?.map((type) => type.trim()).filter((type) => type.length > 0)
    ),

  numWeeks: z
    .number()
    .int()
    .min(1, ValidationErrorMessage.PROGRAM_DURATION_INVALID),

  hasNutritionProgram: z.boolean().optional(),

  phases: z.array(phaseSchema).optional(),

  accessType: z.enum(ProfileAccess),

  createdBy: z.string(),
});

export const createWorkoutSchema = z.object({
  name: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? ValidationErrorMessage.NAME_REQUIRED
          : ValidationErrorMessage.NAME_INVALID_FORMAT,
    })
    .transform((val) => val.trim()),

  description: z
    .string()
    .optional()
    .transform((val) => val?.trim()),

  category: z.array(z.string().min(1, "Category cannot be empty")).optional(),

  difficulty: z
    .enum(Object.values(WorkoutDifficulty) as [string, ...string[]])
    .optional(),

  duration: z.number().int().optional(),

  blocks: z.array(blockSchema),

  accessType: z.enum(ProfileAccess),

  createdBy: z.string({
    error: (issue) =>
      issue.input === undefined
        ? ValidationErrorMessage.CREATOR_ID_REQUIRED
        : ValidationErrorMessage.CREATOR_ID_INVALID_FORMAT,
  }),

  startDate: z.date(),

  endDate: z.date(),
});

export const mealRequestSchema = z.object({
  createdBy: z.string({
    error: (issue) =>
      issue.input === undefined
        ? ValidationErrorMessage.CREATOR_ID_REQUIRED
        : ValidationErrorMessage.CREATOR_ID_INVALID_FORMAT,
  }),
  mealName: z.string().transform((val) => val.trim()),
  macros: z
    .object({
      protein: z.number().int(),
      carbs: z.number().int(),
      fats: z.number().int(),
    })
    .optional(),
  ingredients: z
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
  instructions: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
});
