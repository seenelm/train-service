import { Schema, model, Document } from "mongoose";

export interface IRefreshToken {
  token: string;
  deviceId: string;
  expiresAt: Date;
}

export interface UserDocument extends Document {
  username: string;
  password: string;
  isActive: boolean;
  deviceToken?: string;
  googleId?: string;
  email: string;
  authProvider: string;
  agreeToTerms: boolean;
  refreshTokens: IRefreshToken[];
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema: Schema = new Schema({
  token: { type: String, required: true },
  deviceId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function (this: any) {
        return !this.googleId; // Password is required only if not using Google auth
      },
    },
    deviceToken: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    agreeToTerms: {
      type: Boolean,
      required: true,
    },
    refreshTokens: [refreshTokenSchema],
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>("User", userSchema);
