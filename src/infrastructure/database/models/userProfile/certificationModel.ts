import { Schema, model, Document } from "mongoose";

export interface CertificationDocument extends Document {
  name: string;
  issuer: string;
  imageURL: string;
  certType: string;
  specializations: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const certificationSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    issuer: {
      type: String,
      required: true,
    },
    imageURL: {
      type: String,
      required: true,
    },
    certType: {
      type: String,
      required: true,
    },
    specializations: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

certificationSchema.index({ name: 1 }); // For alphabetical sorting
certificationSchema.index({ name: "text", issuer: "text", certType: "text" }); // For text search
certificationSchema.index({ specializations: 1 }); // For specialization search

export const CertificationModel = model<CertificationDocument>(
  "Certification",
  certificationSchema
);
