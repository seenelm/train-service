import { z } from "zod";
import { ProfileAccess } from "@seenelm/train-core";
import { ValidationErrorMessage } from "../../common/enums.js";

const phaseSchema = z
  .object({
    name: z
      .string()
      .min(1, "Phase name is required")
      .max(100, "Phase name must be 100 characters or less")
      .transform((val) => val.trim()),
    startWeek: z.number().int().min(1, "Start week must be at least 1"),
    endWeek: z.number().int().min(1, "End week must be at least 1"),
  })
  .superRefine((data, ctx) => {
    // Validate that start week is before end week
    if (data.startWeek > data.endWeek) {
      ctx.addIssue({
        code: "custom",
        message: `Phase "${data.name}" start week cannot be after end week`,
        path: ["startWeek"],
      });
    }
  });

export const createProgramSchema = z.object({
  name: z
    .string()
    .min(1, ValidationErrorMessage.PROGRAM_NAME_REQUIRED)
    .max(200, "Program name must be 200 characters or less")
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
    .min(1, ValidationErrorMessage.PROGRAM_DURATION_INVALID)
    .max(104, ValidationErrorMessage.PROGRAM_DURATION_INVALID),

  hasNutritionProgram: z.boolean().optional().default(false),

  phases: z.array(phaseSchema).optional().default([]),

  accessType: z.enum(Object.values(ProfileAccess) as [string, ...string[]], {
    message: ValidationErrorMessage.PROGRAM_ACCESS_TYPE_REQUIRED,
  }),

  createdBy: z.string(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type PhaseInput = z.infer<typeof phaseSchema>;
