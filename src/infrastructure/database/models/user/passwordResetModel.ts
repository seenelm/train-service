import { Schema, model, Document, Types } from "mongoose";

export interface PasswordResetDocument extends Document {
  userId: Types.ObjectId;
  email: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

const passwordResetSchema: Schema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // TTL index: documents will be automatically deleted 'expireAfterSeconds' after the 'expiresAt' time.
      // Setting expireAfterSeconds to 0 means documents are deleted when 'expiresAt' time is reached.
      index: { expires: "0s" },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const PasswordResetModel = model<PasswordResetDocument>(
  "PasswordReset",
  passwordResetSchema
);
