import { Schema, model, Types, Document } from "mongoose";
import { ProfileAccess } from "../../../../common/enums.js";
import { UserProfileRole } from "@seenelm/train-core";

// Social media platform types
export enum SocialPlatform {
  INSTAGRAM = "instagram",
  TWITTER = "twitter",
  SPOTIFY = "spotify",
  LINKEDIN = "linkedin",
  FACEBOOK = "facebook",
  YOUTUBE = "youtube",
  TIKTOK = "tiktok",
  WEBSITE = "website",
}

// Social media link interface
export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface UserProfileDocument extends Document {
  userId: Types.ObjectId;
  username: string;
  name: string;
  bio?: string;
  accountType: number;
  profilePicture?: string;
  role?: UserProfileRole[];
  socialLinks?: SocialLink[];
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

const userProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500,
    },
    accountType: {
      type: Number,
      enum: [ProfileAccess.Public, ProfileAccess.Private],
      default: ProfileAccess.Public,
    },
    profilePicture: {
      type: String,
    },
    role: {
      type: [String],
      enum: Object.values(UserProfileRole),
    },
    socialLinks: [socialLinkSchema],
  },
  {
    timestamps: true,
    indexes: [{ "socialLinks.platform": 1 }, { "socialLinks.username": 1 }],
  }
);

// Add a compound index for efficient social link queries
userProfileSchema.index({
  "socialLinks.platform": 1,
  "socialLinks.username": 1,
});

export const UserProfileModel = model<UserProfileDocument>(
  "UserProfile",
  userProfileSchema
);
