import { z } from "zod";
import { Types } from "mongoose";
import { ProfileAccess } from "@seenelm/train-core";
import { ValidationErrorMessage } from "../../common/enums.js";

// Create Group Schema
export const createGroupSchema = z.object({
  body: z.object({
    name: z
      .string({ error: ValidationErrorMessage.GROUP_NAME_REQUIRED })
      .transform((val) => val.trim())
      .superRefine((val, ctx) => {
        // Check if it's empty or whitespace-only first
        if (!val || val.trim().length === 0) {
          ctx.addIssue({
            code: "custom",
            message: ValidationErrorMessage.GROUP_NAME_REQUIRED,
          });
          return; // Stop here if empty
        }

        // Check length
        if (val.length > 100) {
          ctx.addIssue({
            code: "custom",
            message: ValidationErrorMessage.GROUP_NAME_TOO_LONG,
          });
          return; // Stop here if too long
        }
      }),
    description: z
      .string()
      .optional()
      .transform((val) => val?.trim())
      .superRefine((val, ctx) => {
        if (val && val.length > 500) {
          ctx.addIssue({
            code: "custom",
            message: ValidationErrorMessage.DESCRIPTION_TOO_LONG,
          });
          return; // Stop here if too long
        }
      }),
    location: z
      .string()
      .optional()
      .transform((val) => val?.trim())
      .superRefine((val, ctx) => {
        if (val && val.length > 100) {
          ctx.addIssue({
            code: "custom",
            message: "Location must be 100 characters or less",
          });
          return;
        }
      }),
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
            message: "Maximum 10 tags allowed",
          });
          return;
        }
        if (val) {
          for (const tag of val) {
            if (tag.length > 20) {
              ctx.addIssue({
                code: "custom",
                message: "Each tag must be 20 characters or less",
              });
              return;
            }
          }
        }
      }),
    accountType: z.enum(ProfileAccess).optional().default(ProfileAccess.Public),
  }),
});

// Note: CreateGroupRequest is now imported from @seenelm/train-core

// Join Group Schema
export const joinGroupSchema = z.object({
  params: z.object({
    groupId: z
      .string()
      .min(1, ValidationErrorMessage.GROUP_ID_REQUIRED)
      .refine((val) => Types.ObjectId.isValid(val), {
        message: ValidationErrorMessage.GROUP_ID_INVALID_FORMAT,
      }),
  }),
});

export type JoinGroupRequest = z.infer<typeof joinGroupSchema>;

// Request to Join Group Schema (same as join group since it uses same params)
export const requestToJoinGroupSchema = z.object({
  params: z.object({
    groupId: z
      .string()
      .min(1, ValidationErrorMessage.GROUP_ID_REQUIRED)
      .refine((val) => Types.ObjectId.isValid(val), {
        message: ValidationErrorMessage.GROUP_ID_INVALID_FORMAT,
      }),
  }),
});

export type RequestToJoinGroupRequest = z.infer<
  typeof requestToJoinGroupSchema
>;

// Accept Join Request Schema
export const acceptJoinRequestSchema = z.object({
  params: z.object({
    groupId: z
      .string()
      .min(1, ValidationErrorMessage.GROUP_ID_REQUIRED)
      .refine((val) => Types.ObjectId.isValid(val), {
        message: ValidationErrorMessage.GROUP_ID_INVALID_FORMAT,
      }),
    requesterId: z
      .string()
      .min(1, "Requester ID is required")
      .refine((val) => Types.ObjectId.isValid(val), {
        message: "Requester ID must be a valid ObjectId",
      }),
  }),
});

export type AcceptJoinRequestRequest = z.infer<typeof acceptJoinRequestSchema>;

// Reject Join Request Schema (same as accept since it uses same params)
export const rejectJoinGroupRequestSchema = z.object({
  params: z.object({
    groupId: z
      .string()
      .min(1, ValidationErrorMessage.GROUP_ID_REQUIRED)
      .refine((val) => Types.ObjectId.isValid(val), {
        message: ValidationErrorMessage.GROUP_ID_INVALID_FORMAT,
      }),
    requesterId: z
      .string()
      .min(1, "Requester ID is required")
      .refine((val) => Types.ObjectId.isValid(val), {
        message: "Requester ID must be a valid ObjectId",
      }),
  }),
});

export type RejectJoinGroupRequestRequest = z.infer<
  typeof rejectJoinGroupRequestSchema
>;

// Leave Group Schema
export const leaveGroupSchema = z.object({
  params: z.object({
    groupId: z
      .string()
      .min(1, ValidationErrorMessage.GROUP_ID_REQUIRED)
      .refine((val) => Types.ObjectId.isValid(val), {
        message: ValidationErrorMessage.GROUP_ID_INVALID_FORMAT,
      }),
  }),
});

export type LeaveGroupRequest = z.infer<typeof leaveGroupSchema>;

// Remove Member From Group Schema
export const removeMemberFromGroupSchema = z.object({
  params: z.object({
    groupId: z
      .string()
      .min(1, ValidationErrorMessage.GROUP_ID_REQUIRED)
      .refine((val) => Types.ObjectId.isValid(val), {
        message: ValidationErrorMessage.GROUP_ID_INVALID_FORMAT,
      }),
    memberId: z
      .string()
      .min(1, "Member ID is required")
      .refine((val) => Types.ObjectId.isValid(val), {
        message: "Member ID must be a valid ObjectId",
      }),
  }),
});

export type RemoveMemberFromGroupRequest = z.infer<
  typeof removeMemberFromGroupSchema
>;

// Delete Group Schema
export const deleteGroupSchema = z.object({
  params: z.object({
    groupId: z
      .string()
      .min(1, ValidationErrorMessage.GROUP_ID_REQUIRED)
      .refine((val) => Types.ObjectId.isValid(val), {
        message: ValidationErrorMessage.GROUP_ID_INVALID_FORMAT,
      }),
  }),
});

export type DeleteGroupRequest = z.infer<typeof deleteGroupSchema>;

// Update Group Profile Schema
export const updateGroupProfileSchema = z.object({
  params: z.object({
    groupId: z
      .string()
      .min(1, ValidationErrorMessage.GROUP_ID_REQUIRED)
      .refine((val) => Types.ObjectId.isValid(val), {
        message: ValidationErrorMessage.GROUP_ID_INVALID_FORMAT,
      }),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, ValidationErrorMessage.GROUP_NAME_REQUIRED)
      .max(100, ValidationErrorMessage.GROUP_NAME_TOO_LONG)
      .trim()
      .refine((val) => /^[a-zA-Z0-9\s\-_]+$/.test(val), {
        message: ValidationErrorMessage.GROUP_NAME_INVALID_CHARACTERS,
      })
      .optional(),
    description: z
      .string()
      .max(500, ValidationErrorMessage.DESCRIPTION_TOO_LONG)
      .trim()
      .optional(),
    location: z
      .string()
      .max(100, "Location must be 100 characters or less")
      .trim()
      .optional(),
    tags: z
      .array(z.string())
      .max(10, "Maximum 10 tags allowed")
      .optional()
      .transform((val) =>
        val
          ?.map((tag) => tag.trim())
          .filter((tag) => tag.length > 0 && tag.length <= 20)
      ),
    accountType: z.enum(ProfileAccess).optional(),
  }),
});

export type UpdateGroupProfileRequest = z.infer<
  typeof updateGroupProfileSchema
>;
