import { z } from "zod";

export const createEventSchema = z.object({
  name: z
    .string()
    .min(1, "Event name is required")
    .max(100, "Event name must be 100 characters or less"),
  admin: z
    .array(z.string().min(1, "Admin ID is required"))
    .min(1, "At least one admin is required"),
  invitees: z.array(z.string().min(1, "Invitee ID is required")).optional(),
  startTime: z
    .string()
    .datetime("Start time must be a valid date")
    .transform((val) => new Date(val)),
  endTime: z
    .string()
    .datetime("End time must be a valid date")
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  location: z
    .string()
    .max(200, "Location must be 200 characters or less")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  alerts: z
    .array(
      z.object({
        alertTime: z
          .string()
          .datetime("Alert time must be a valid date")
          .transform((val) => new Date(val)),
        isCompleted: z.boolean().default(false),
      })
    )
    .optional(),
});
