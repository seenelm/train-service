import { z } from "zod";

export const searchQuerySchema = z.object({
  searchTerm: z
    .string()
    .min(1, { message: "Search term is required" })
    .max(100, { message: "Search term must be 100 characters or less" })
    .regex(/^[a-zA-Z0-9\s\-.,!?()&@#$%*+=:;]+$/, {
      message: "Search term contains invalid characters",
    })
    .refine(
      (val: string) =>
        val.trim().length > 0 &&
        !/[\x00-\x1F\x7F]/.test(val) &&
        !/\s{3,}/.test(val),
      {
        message: "Search term normalization failed",
      }
    ),
  page: z
    .string()
    .optional()
    .transform((val: string | undefined) => parseInt(val || "1"))
    .refine(
      (val: number) => Number.isInteger(val) && val >= 1 && val <= 10000,
      {
        message: "Page number must be between 1 and 10000",
      }
    ),
  limit: z
    .string()
    .optional()
    .transform((val: string | undefined) => parseInt(val || "20"))
    .refine((val: number) => Number.isInteger(val) && val >= 1 && val <= 1000, {
      message: "Limit must be between 1 and 1000",
    }),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
