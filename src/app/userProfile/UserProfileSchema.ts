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
