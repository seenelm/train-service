import { Schema, model, Types, Document } from "mongoose";
import {
  SocialPlatform,
  ProfileAccess,
  CustomSectionType,
} from "@seenelm/train-core";

// Social media link interface
export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface Certification {
  certification: Types.ObjectId;
  specializations: string[];
}

export interface AchievementItem {
  title: string;
  date?: string;
  description?: string;
}
export interface GenericItem {
  [key: string]: string | number | boolean | null;
}

export interface CustomSection {
  title: CustomSectionType;
  details: AchievementItem[] | GenericItem[];
}

// export interface Education {
//   institution: string;
//   degree: string;
//   fieldOfStudy?: string;
//   startDate?: Date;
//   endDate?: Date;
//   description?: string;
// }

export interface UserProfileDocument extends Document {
  userId: Types.ObjectId;
  username: string;
  name: string;
  bio?: string;
  accountType: ProfileAccess;
  profilePicture?: string;
  role?: string;
  location?: string;
  socialLinks?: SocialLink[];
  certifications?: Certification[];
  customSections?: CustomSection[];
  // education?: Education[];
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
      unique: true,
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
    speializations: [String],
  },
  { _id: false }
);

// const educationSchema = new Schema(
//   {
//     institution: {
//       type: String,
//       required: true,
//     },
//     degree: {
//       type: String,
//       required: true,
//     },
//     fieldOfStudy: {
//       type: String,
//     },
//     startDate: {
//       type: Date,
//     },
//     endDate: {
//       type: Date,
//     },
//     description: {
//       type: String,
//     },
//   },
//   { _id: false }
// );

const userProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // index: true,
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
    profilePicture: {
      type: String,
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
    // education: [educationSchema],
  },
  {
    timestamps: true,
    // indexes: [{ "socialLinks.platform": 1 }, { "socialLinks.username": 1 }],
  }
);

// Add a compound index for efficient social link queries
// userProfileSchema.index({
//   "socialLinks.platform": 1,
//   "socialLinks.username": 1,
// });

export const UserProfileModel = model<UserProfileDocument>(
  "UserProfile",
  userProfileSchema
);
