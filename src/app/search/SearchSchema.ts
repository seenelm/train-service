import { z } from "zod";
import { ValidationErrorMessage } from "../../common/enums.js";

// Production-grade security schema
export const searchQuerySchema = z.object({
  searchTerm: z
    .string({ error: ValidationErrorMessage.SEARCH_TERM_REQUIRED }) // Use enum value
    .transform((val) => {
      // Normalize input: trim, lowercase, remove extra spaces
      return val.trim().toLowerCase().replace(/\s+/g, " ");
    })
    .superRefine((val, ctx) => {
      // Check if it's empty or whitespace-only first
      if (!val || val.trim().length === 0) {
        ctx.addIssue({
          code: "custom",
          message: ValidationErrorMessage.SEARCH_TERM_REQUIRED, // Use enum value
        });
        return; // Stop here if empty
      }

      // Check length (prevent DoS)
      if (val.length > 100) {
        ctx.addIssue({
          code: "custom",
          message: ValidationErrorMessage.SEARCH_TERM_TOO_LONG, // Use enum value
        });
        return; // Stop here if too long
      }

      // Strict whitelist pattern (production-grade)
      const safePattern = /^[a-zA-Z0-9\s\-.,!?()&@#%*+=:;]+$/;
      if (!safePattern.test(val)) {
        ctx.addIssue({
          code: "custom",
          message: ValidationErrorMessage.SEARCH_TERM_INVALID_CHARACTERS, // Use enum value
        });
        return; // Stop here if invalid characters
      }

      // Check for control characters and excessive whitespace
      if (/[\x00-\x1F\x7F]/.test(val) || /\s{3,}/.test(val)) {
        ctx.addIssue({
          code: "custom",
          message: ValidationErrorMessage.SEARCH_TERM_NORMALIZATION_FAILED, // Use enum value
        });
        return; // Stop here if normalization fails
      }
    }),
  page: z
    .string()
    .optional()
    .transform((val: string | undefined) => parseInt(val || "1"))
    .refine(
      (val: number) => Number.isInteger(val) && val >= 1 && val <= 10000,
      {
        message: ValidationErrorMessage.PAGE_NUMBER_INVALID, // Use enum value
      }
    ),
  limit: z
    .string()
    .optional()
    .transform((val: string | undefined) => parseInt(val || "20"))
    .refine((val: number) => Number.isInteger(val) && val >= 1 && val <= 1000, {
      message: ValidationErrorMessage.LIMIT_INVALID, // Use enum value
    }),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
