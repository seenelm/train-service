import { Schema, model, Document, Types } from "mongoose";

export interface EventDocument extends Document {
  title: string;
  admin: Types.ObjectId[];
  invitees?: Types.ObjectId[];
  startTime: Date;
  endTime?: Date;
  location?: string;
  description?: string;
  tags?: string[];
  alerts?: Alert[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  alertTime: Date;
  isCompleted: boolean;
}

const alertSchema = new Schema(
  {
    alertTime: {
      type: Date,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { _id: false }
);

const EventSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    admin: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      required: true,
    },
    invitees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: false,
    },
    location: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    tags: {
      type: [String],
      required: false,
    },
    alerts: {
      type: [alertSchema],
      required: false,
    },
  },
  { timestamps: true }
);

export const Event = model<EventDocument>("Event", EventSchema);
