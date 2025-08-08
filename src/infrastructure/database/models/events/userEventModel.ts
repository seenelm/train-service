import { Schema, model, Types, Document } from "mongoose";
import { EventStatus } from "../../../../common/enums.js";

interface Event {
  eventId: Types.ObjectId;
  status: EventStatus;
}

export interface UserEventDocument extends Document {
  userId: Types.ObjectId;
  events: Event[];
  createdAt: Date;
  updatedAt: Date;
}

const userEventSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    events: [
      {
        eventId: {
          type: Schema.Types.ObjectId,
          ref: "Event",
        },
        status: {
          type: Number,
          enum: [
            EventStatus.Accepted,
            EventStatus.Rejected,
            EventStatus.Pending,
          ],
          default: EventStatus.Pending,
        },
      },
    ],
  },
  { timestamps: true }
);

export const UserEvent = model<UserEventDocument>("UserEvent", userEventSchema);
