import { Schema, model, Document } from "mongoose";

export interface CertificationDocument extends Document {
  name: string;
  issuer: string;
  imageURL: string;
  certType: string;
  specializations: string[];
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

export const CertificationModel = model<CertificationDocument>(
  "Certification",
  certificationSchema
);
