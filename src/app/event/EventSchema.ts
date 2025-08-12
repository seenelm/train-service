import { z } from "zod";
import { EventStatus, ValidationErrorMessage } from "../../common/enums.js";

export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, ValidationErrorMessage.EVENT_TITLE_REQUIRED)
    .max(100, ValidationErrorMessage.EVENT_TITLE_TOO_LONG)
    .transform((val) => val.trim()),
  admin: z
    .array(z.string().min(1, "Admin ID is required"))
    .min(1, "At least one admin is required")
    .refine((val) => val.every((id) => /^[0-9a-fA-F]{24}$/.test(id)), {
      message: ValidationErrorMessage.EVENT_ADMIN_ID_INVALID,
    }),
  invitees: z
    .array(z.string().min(1, "Invitee ID is required"))
    .optional()
    .refine((val) => !val || val.every((id) => /^[0-9a-fA-F]{24}$/.test(id)), {
      message: ValidationErrorMessage.EVENT_INVITEE_ID_INVALID,
    }),
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
    .max(200, ValidationErrorMessage.EVENT_LOCATION_TOO_LONG)
    .optional()
    .transform((val) => val?.trim()),
  description: z
    .string()
    .max(500, ValidationErrorMessage.EVENT_DESCRIPTION_TOO_LONG)
    .optional()
    .transform((val) => val?.trim()),
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
  tags: z
    .array(z.string())
    .optional()
    .transform((val) =>
      val?.map((tag) => tag.trim()).filter((tag) => tag.length > 0)
    )
    .superRefine((val, ctx) => {
      if (val && val.length > 10) {
        ctx.addIssue({
          code: "custom",
          message: ValidationErrorMessage.EVENT_TAGS_TOO_MANY,
        });
        return;
      }
      if (val) {
        for (const tag of val) {
          if (tag.length > 20) {
            ctx.addIssue({
              code: "custom",
              message: ValidationErrorMessage.EVENT_TAG_TOO_LONG,
            });
            return;
          }
        }
      }
    }),
});

export const updateEventSchema = z.object({
  title: z
    .string()
    .min(1, ValidationErrorMessage.EVENT_TITLE_REQUIRED)
    .max(100, ValidationErrorMessage.EVENT_TITLE_TOO_LONG)
    .optional()
    .transform((val) => val?.trim()),
  admin: z
    .array(z.string().min(1, "Admin ID is required"))
    .min(1, "At least one admin is required")
    .optional()
    .refine((val) => !val || val.every((id) => /^[0-9a-fA-F]{24}$/.test(id)), {
      message: ValidationErrorMessage.EVENT_ADMIN_ID_INVALID,
    }),
  invitees: z
    .array(z.string().min(1, "Invitee ID is required"))
    .optional()
    .refine((val) => !val || val.every((id) => /^[0-9a-fA-F]{24}$/.test(id)), {
      message: ValidationErrorMessage.EVENT_INVITEE_ID_INVALID,
    }),
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
    .max(200, ValidationErrorMessage.EVENT_LOCATION_TOO_LONG)
    .optional()
    .transform((val) => val?.trim()),
  description: z
    .string()
    .max(500, ValidationErrorMessage.EVENT_DESCRIPTION_TOO_LONG)
    .optional()
    .transform((val) => val?.trim()),
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
  tags: z
    .array(z.string())
    .optional()
    .transform((val) =>
      val?.map((tag) => tag.trim()).filter((tag) => tag.length > 0)
    )
    .superRefine((val, ctx) => {
      if (val && val.length > 10) {
        ctx.addIssue({
          code: "custom",
          message: ValidationErrorMessage.EVENT_TAGS_TOO_MANY,
        });
        return;
      }
      if (val) {
        for (const tag of val) {
          if (tag.length > 20) {
            ctx.addIssue({
              code: "custom",
              message: ValidationErrorMessage.EVENT_TAG_TOO_LONG,
            });
            return;
          }
        }
      }
    }),
});

export const updateUserEventStatusSchema = z.object({
  eventId: z
    .string()
    .min(1, "Event ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Event ID must be a valid ObjectId"),
  status: z.enum(EventStatus),
});
