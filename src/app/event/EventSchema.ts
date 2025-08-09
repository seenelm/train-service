import { z } from "zod";
import { EventStatus } from "../../common/enums.js";

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

export const updateEventSchema = z.object({
  name: z
    .string()
    .min(1, "Event name is required")
    .max(100, "Event name must be 100 characters or less")
    .optional(),
  admin: z
    .array(z.string().min(1, "Admin ID is required"))
    .min(1, "At least one admin is required")
    .optional(),
  invitees: z.array(z.string().min(1, "Invitee ID is required")).optional(),
  startTime: z
    .string()
    .datetime("Start time must be a valid date")
    .transform((val) => new Date(val))
    .optional(),
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

export const updateUserEventStatusSchema = z.object({
  eventId: z
    .string()
    .min(1, "Event ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Event ID must be a valid ObjectId"),
  status: z.enum(EventStatus),
});
