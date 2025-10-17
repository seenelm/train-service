import { z } from "zod";
import { Types } from "mongoose";
import { ValidationErrorMessage } from "../../common/enums.js";
import {
  ProfileAccess,
  SocialPlatform,
  CustomSectionType,
} from "@seenelm/train-core";

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

const socialLinkSchema = z.object({
  platform: z.enum(Object.values(SocialPlatform) as [string, ...string[]]),
  url: z.string(),
});

const certificationSchema = z.object({
  certification: z.string(),
  specializations: z.array(z.string()),
  receivedDate: z.string(),
});

const customSectionSchema = z.object({
  title: z.enum(Object.values(CustomSectionType) as [string, ...string[]]),
  details: z.array(z.string()),
});

export const userProfileRequestSchema = z.object({
  userId: z.string(),
  username: z.string(),
  name: z.string(),
  phoneNumber: z.string().optional(),
  birthday: z
    .union([z.date(), z.string().transform((val) => new Date(val))])
    .optional(),
  bio: z.string().optional(),
  accountType: z.union([
    z.literal(ProfileAccess.Public),
    z.literal(ProfileAccess.Private),
  ]),
  role: z.array(z.string()).optional(),
  location: z.string().optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  customSections: z.array(customSectionSchema).optional(),
});
