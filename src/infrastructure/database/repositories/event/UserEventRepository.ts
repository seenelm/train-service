import { UserEventDocument } from "../../models/events/userEventModel.js";
import UserEvent from "../../entity/event/UserEvent.js";
import UserEventDetails from "../../entity/event/UserEventDetails.js";
import Event from "../../entity/event/Event.js";
import { IBaseRepository, BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";
import { EventStatus } from "../../../../common/enums.js";
import { UserEventResponse } from "@seenelm/train-core";

export interface IUserEventRepository
  extends IBaseRepository<UserEvent, UserEventDocument> {
  toResponse(entity: UserEventDetails): UserEventResponse;
  findByUserId(userId: Types.ObjectId): Promise<UserEvent[]>;
  getUserEventsWithDetails(userId: Types.ObjectId): Promise<UserEventDetails[]>;
  getUserEventWithDetails(
    userId: Types.ObjectId,
    eventId: Types.ObjectId
  ): Promise<UserEventDetails | null>;
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
    eventId: Types.ObjectId,
    options?: any
  ): Promise<void>;
  removeEventFromAllUsers(
    eventId: Types.ObjectId,
    options?: any
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

  toResponse(entity: UserEventDetails): UserEventResponse {
    return {
      event: {
        id: entity.getEvent().getId().toString(),
        name: entity.getEvent().getName(),
        admin: entity
          .getEvent()
          .getAdmin()
          .map((id) => id.toString()),
        invitees: entity
          .getEvent()
          .getInvitees()
          ?.map((id) => id.toString()),
        startTime: entity.getEvent().getStartTime(),
        endTime: entity.getEvent().getEndTime(),
        location: entity.getEvent().getLocation(),
        description: entity.getEvent().getDescription(),
        alerts: entity.getEvent().getAlerts(),
      },
      status: entity.getStatus(),
    };
  }

  async findByUserId(userId: Types.ObjectId): Promise<UserEvent[]> {
    const documents = await this.userEventModel.find({ userId });
    return documents.map((doc) => this.toEntity(doc));
  }

  async getUserEventsWithDetails(
    userId: Types.ObjectId
  ): Promise<UserEventDetails[]> {
    const pipeline = [
      // Match user events for the specific user
      { $match: { userId } },

      // Unwind the events array to work with individual events
      { $unwind: "$events" },

      // Lookup event details from the events collection
      {
        $lookup: {
          from: "events", // Collection name for events
          localField: "events.eventId",
          foreignField: "_id",
          as: "eventDetails",
        },
      },

      // Unwind the eventDetails array (should only have one element)
      { $unwind: "$eventDetails" },

      // Project the final structure
      {
        $project: {
          _id: 0,
          event: {
            id: "$eventDetails._id",
            name: "$eventDetails.name",
            admin: "$eventDetails.admin",
            invitees: "$eventDetails.invitees",
            startTime: "$eventDetails.startTime",
            endTime: "$eventDetails.endTime",
            location: "$eventDetails.location",
            description: "$eventDetails.description",
            alerts: "$eventDetails.alerts",
          },
          status: "$events.status",
        },
      },
    ];

    const results = await this.userEventModel.aggregate(pipeline);

    // Convert aggregation results to UserEventDetails entities
    return results.map((result) => {
      const event = Event.builder()
        .setId(result.event.id)
        .setName(result.event.name)
        .setAdmin(result.event.admin)
        .setInvitees(result.event.invitees)
        .setStartTime(result.event.startTime)
        .setEndTime(result.event.endTime)
        .setLocation(result.event.location)
        .setDescription(result.event.description)
        .setAlerts(result.event.alerts)
        .build();

      return UserEventDetails.builder()
        .setEvent(event)
        .setStatus(result.status)
        .build();
    });
  }

  async getUserEventWithDetails(
    userId: Types.ObjectId,
    eventId: Types.ObjectId
  ): Promise<UserEventDetails | null> {
    const pipeline = [
      // Match user events for the specific user
      { $match: { userId } },

      // Unwind the events array to work with individual events
      { $unwind: "$events" },

      // Match the specific event
      { $match: { "events.eventId": eventId } },

      // Lookup event details from the events collection
      {
        $lookup: {
          from: "events",
          localField: "events.eventId",
          foreignField: "_id",
          as: "eventDetails",
        },
      },

      // Unwind the eventDetails array (should only have one element)
      { $unwind: "$eventDetails" },

      // Project the final structure
      {
        $project: {
          _id: 0,
          event: {
            id: "$eventDetails._id",
            name: "$eventDetails.name",
            admin: "$eventDetails.admin",
            invitees: "$eventDetails.invitees",
            startTime: "$eventDetails.startTime",
            endTime: "$eventDetails.endTime",
            location: "$eventDetails.location",
            description: "$eventDetails.description",
            alerts: "$eventDetails.alerts",
          },
          status: "$events.status",
        },
      },

      // Limit to first result since we're looking for a specific event
      { $limit: 1 },
    ];

    const results = await this.userEventModel.aggregate(pipeline);

    if (results.length === 0) {
      return null;
    }

    const result = results[0];

    // Convert aggregation result to UserEventDetails entity
    const event = Event.builder()
      .setId(result.event.id)
      .setName(result.event.name)
      .setAdmin(result.event.admin)
      .setInvitees(result.event.invitees)
      .setStartTime(result.event.startTime)
      .setEndTime(result.event.endTime)
      .setLocation(result.event.location)
      .setDescription(result.event.description)
      .setAlerts(result.event.alerts)
      .build();

    return UserEventDetails.builder()
      .setEvent(event)
      .setStatus(result.status)
      .build();
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
    eventId: Types.ObjectId,
    options?: any
  ): Promise<void> {
    await this.userEventModel.updateOne(
      { userId },
      {
        $pull: {
          events: {
            eventId,
          },
        },
      },
      options
    );
  }

  async removeEventFromAllUsers(
    eventId: Types.ObjectId,
    options?: any
  ): Promise<void> {
    await this.userEventModel.updateMany(
      { "events.eventId": eventId },
      { $pull: { events: { eventId } } },
      options
    );
  }
}
