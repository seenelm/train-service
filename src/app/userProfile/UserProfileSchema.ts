import { z } from "zod";
import { Types } from "mongoose";
import { ValidationErrorMessage } from "../../common/enums.js";

// Follow User Schema - using params only since userId comes from auth middleware
export const followUserSchema = z.object({
  params: z.object({
    followeeId: z
      .string()
      .min(1, ValidationErrorMessage.USER_ID_REQUIRED)
      .refine((val) => Types.ObjectId.isValid(val), {
        message: ValidationErrorMessage.USER_ID_INVALID_FORMAT,
      }),
  }),
});

// Request to Follow User Schema - for private accounts
export const requestToFollowUserSchema = z.object({
  params: z.object({
    followeeId: z
      .string()
      .min(1, ValidationErrorMessage.USER_ID_REQUIRED)
      .refine((val) => Types.ObjectId.isValid(val), {
        message: ValidationErrorMessage.USER_ID_INVALID_FORMAT,
      }),
  }),
});

// Accept Follow Request Schema
export const acceptFollowRequestSchema = z.object({
  params: z.object({
    followerId: z
      .string()
      .min(1, ValidationErrorMessage.USER_ID_REQUIRED)
      .refine((val) => Types.ObjectId.isValid(val), {
        message: ValidationErrorMessage.USER_ID_INVALID_FORMAT,
      }),
  }),
});

// Reject Follow Request Schema
export const rejectFollowRequestSchema = z.object({
  params: z.object({
    followerId: z
      .string()
      .min(1, ValidationErrorMessage.USER_ID_REQUIRED)
      .refine((val) => Types.ObjectId.isValid(val), {
        message: ValidationErrorMessage.USER_ID_INVALID_FORMAT,
      }),
  }),
});

// Unfollow User Schema
export const unfollowUserSchema = z.object({
  params: z.object({
    followeeId: z
      .string()
      .min(1, ValidationErrorMessage.USER_ID_REQUIRED)
      .refine((val) => Types.ObjectId.isValid(val), {
        message: ValidationErrorMessage.USER_ID_INVALID_FORMAT,
      }),
  }),
});

// Remove Follower Schema
export const removeFollowerSchema = z.object({
  params: z.object({
    followerId: z
      .string()
      .min(1, ValidationErrorMessage.USER_ID_REQUIRED)
      .refine((val) => Types.ObjectId.isValid(val), {
        message: ValidationErrorMessage.USER_ID_INVALID_FORMAT,
      }),
  }),
});

// Schema for cursor pagination query parameters
export const cursorPaginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .pipe(
      z
        .number()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit must be at most 100")
    ),
  cursor: z.string().optional(),
});

// Schema for search with cursor pagination
export const searchWithCursorSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .pipe(
      z
        .number()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit must be at most 100")
    ),
  cursor: z.string().optional(),
  searchTerm: z
    .string()
    .min(1, "Search term is required")
    .max(100, "Search term must be at most 100 characters"),
});

// Type exports
export type FollowUserRequest = z.infer<typeof followUserSchema>;
export type RequestToFollowUserRequest = z.infer<
  typeof requestToFollowUserSchema
>;
export type AcceptFollowRequestRequest = z.infer<
  typeof acceptFollowRequestSchema
>;
export type RejectFollowRequestRequest = z.infer<
  typeof rejectFollowRequestSchema
>;
export type UnfollowUserRequest = z.infer<typeof unfollowUserSchema>;
export type RemoveFollowerRequest = z.infer<typeof removeFollowerSchema>;
