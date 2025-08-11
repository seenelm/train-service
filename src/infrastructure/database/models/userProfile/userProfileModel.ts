import { Schema, model, Types, Document } from "mongoose";
import {
  SocialPlatform,
  ProfileAccess,
  CustomSectionType,
  AchievementItem,
  StatsItem,
} from "@seenelm/train-core";

// Social media link interface
export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface Certification {
  certification: Types.ObjectId;
  specializations: string[];
  receivedDate: string;
}

export interface CustomSection {
  title: CustomSectionType;
  details: AchievementItem[] | StatsItem[] | string[];
}

export interface UserProfileDocument extends Document {
  userId: Types.ObjectId;
  username: string;
  name: string;
  bio?: string;
  accountType: ProfileAccess;
  role?: string;
  location?: string;
  socialLinks?: SocialLink[];
  certifications?: Certification[];
  customSections?: CustomSection[];
  createdAt: Date;
  updatedAt: Date;
}

const socialLinkSchema = new Schema(
  {
    platform: {
      type: String,
      enum: Object.values(SocialPlatform),
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const customSectionSchema = new Schema(
  {
    title: {
      type: String,
      enum: Object.values(CustomSectionType),
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const certificationSchema = new Schema(
  {
    certification: {
      type: Schema.Types.ObjectId,
      ref: "Certification",
      required: true,
    },
    specializations: [String],
    receivedDate: {
      type: String,
    },
  },
  { _id: false }
);

const userProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    accountType: {
      type: Number,
      required: true,
      enum: [ProfileAccess.Public, ProfileAccess.Private],
      default: ProfileAccess.Public,
    },
    role: {
      type: String,
    },
    location: {
      type: String,
    },
    socialLinks: [socialLinkSchema],
    certifications: [certificationSchema],
    customSections: [customSectionSchema],
  },
  {
    timestamps: true,
  }
);

export const UserProfileModel = model<UserProfileDocument>(
  "UserProfile",
  userProfileSchema
);
