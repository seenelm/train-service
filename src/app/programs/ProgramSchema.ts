import { z } from "zod";
import { ProfileAccess } from "@seenelm/train-core";
import { ValidationErrorMessage } from "../../common/enums.js";

const phaseSchema = z.object({
  name: z.string().transform((val) => val.trim()),
  startWeek: z.number().int(),
  endWeek: z.number().int(),
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

  hasNutritionProgram: z.boolean().optional().default(false),

  phases: z.array(phaseSchema).optional().default([]),

  accessType: z.enum(ProfileAccess),

  createdBy: z.string(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type PhaseInput = z.infer<typeof phaseSchema>;
