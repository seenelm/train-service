import { UserEventDocument } from "../../models/events/userEventModel.js";
import UserEvent from "../../entity/event/UserEvent.js";
import { IBaseRepository, BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";
import { EventStatus } from "../../../../common/enums.js";

export interface IUserEventRepository
  extends IBaseRepository<UserEvent, UserEventDocument> {
  findByUserId(userId: Types.ObjectId): Promise<UserEvent[]>;
  findUserEventsByStatus(
    userId: Types.ObjectId,
    status: EventStatus
  ): Promise<UserEvent[]>;
  findUserEventsByEventId(eventId: Types.ObjectId): Promise<UserEvent[]>;
  findUsersByEventAndStatus(
    eventId: Types.ObjectId,
    status: EventStatus
  ): Promise<UserEvent[]>;
  updateUserEventStatus(
    userId: Types.ObjectId,
    eventId: Types.ObjectId,
    status: EventStatus
  ): Promise<void>;
  addEventToUser(
    userId: Types.ObjectId,
    eventId: Types.ObjectId,
    status?: EventStatus
  ): Promise<void>;
  removeEventFromUser(
    userId: Types.ObjectId,
    eventId: Types.ObjectId
  ): Promise<void>;
}

export default class UserEventRepository
  extends BaseRepository<UserEvent, UserEventDocument>
  implements IUserEventRepository
{
  private userEventModel: Model<UserEventDocument>;

  constructor(userEventModel: Model<UserEventDocument>) {
    super(userEventModel);
    this.userEventModel = userEventModel;
  }

  toEntity(doc: UserEventDocument): UserEvent {
    return UserEvent.builder()
      .setId(doc._id as Types.ObjectId)
      .setUserId(doc.userId as Types.ObjectId)
      .setEvents(
        doc.events.map((event) => ({
          eventId: event.eventId as Types.ObjectId,
          status: event.status as EventStatus,
        }))
      )
      .setCreatedAt(doc.createdAt)
      .setUpdatedAt(doc.updatedAt)
      .build();
  }

  async findByUserId(userId: Types.ObjectId): Promise<UserEvent[]> {
    const documents = await this.userEventModel.find({ userId });
    return documents.map((doc) => this.toEntity(doc));
  }

  async findUserEventsByStatus(
    userId: Types.ObjectId,
    status: EventStatus
  ): Promise<UserEvent[]> {
    const documents = await this.userEventModel.find({
      userId,
      "events.status": status,
    });
    return documents.map((doc) => this.toEntity(doc));
  }

  async findUserEventsByEventId(eventId: Types.ObjectId): Promise<UserEvent[]> {
    const documents = await this.userEventModel.find({
      "events.eventId": eventId,
    });
    return documents.map((doc) => this.toEntity(doc));
  }

  async findUsersByEventAndStatus(
    eventId: Types.ObjectId,
    status: EventStatus
  ): Promise<UserEvent[]> {
    const documents = await this.userEventModel.find({
      "events.eventId": eventId,
      "events.status": status,
    });
    return documents.map((doc) => this.toEntity(doc));
  }

  async updateUserEventStatus(
    userId: Types.ObjectId,
    eventId: Types.ObjectId,
    status: EventStatus
  ): Promise<void> {
    await this.userEventModel.updateOne(
      {
        userId,
        "events.eventId": eventId,
      },
      {
        $set: {
          "events.$.status": status,
        },
      }
    );
  }

  async addEventToUser(
    userId: Types.ObjectId,
    eventId: Types.ObjectId,
    status: EventStatus = EventStatus.Pending
  ): Promise<void> {
    // Check if user already has events
    const existingUserEvent = await this.userEventModel.findOne({ userId });

    if (existingUserEvent) {
      // Add event to existing user events
      await this.userEventModel.updateOne(
        { userId },
        {
          $push: {
            events: {
              eventId,
              status,
            },
          },
        }
      );
    } else {
      // Create new user event document
      await this.userEventModel.create({
        userId,
        events: [
          {
            eventId,
            status,
          },
        ],
      });
    }
  }

  async removeEventFromUser(
    userId: Types.ObjectId,
    eventId: Types.ObjectId
  ): Promise<void> {
    await this.userEventModel.updateOne(
      { userId },
      {
        $pull: {
          events: {
            eventId,
          },
        },
      }
    );
  }
}
