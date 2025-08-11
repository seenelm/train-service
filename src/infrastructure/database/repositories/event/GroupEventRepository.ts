import { GroupEventDocument } from "../../models/events/groupEventModel.js";
import GroupEvent from "../../entity/event/GroupEvent.js";
import UserEventDetails from "../../entity/event/UserEventDetails.js";
import Event from "../../entity/event/Event.js";
import { IBaseRepository, BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";
import { EventStatus } from "../../../../common/enums.js";
import { GroupEventResponse } from "@seenelm/train-core";

export interface IGroupEventRepository
  extends IBaseRepository<GroupEvent, GroupEventDocument> {
  //   toResponse(entity: UserEventDetails): UserEventResponse;
  //   findByUserId(userId: Types.ObjectId): Promise<UserEvent[]>;
  //   getUserEventsWithDetails(userId: Types.ObjectId): Promise<UserEventDetails[]>;
  //   getUserEventWithDetails(
  //     userId: Types.ObjectId,
  //     eventId: Types.ObjectId
  //   ): Promise<UserEventDetails | null>;
  //   findUserEventsByStatus(
  //     userId: Types.ObjectId,
  //     status: EventStatus
  //   ): Promise<UserEvent[]>;
  //   findUserEventsByEventId(eventId: Types.ObjectId): Promise<UserEvent[]>;
  //   findUsersByEventAndStatus(
  //     eventId: Types.ObjectId,
  //     status: EventStatus
  //   ): Promise<UserEvent[]>;
  //   updateUserEventStatus(
  //     userId: Types.ObjectId,
  //     eventId: Types.ObjectId,
  //     status: EventStatus
  //   ): Promise<void>;
  addEventToGroup(
    groupId: Types.ObjectId,
    eventId: Types.ObjectId
  ): Promise<void>;
  removeEventFromGroup(
    groupId: Types.ObjectId,
    eventId: Types.ObjectId,
    options?: any
  ): Promise<void>;
  getGroupEvents(groupId: Types.ObjectId): Promise<Event[]>;
  getGroupEventById(
    groupId: Types.ObjectId,
    eventId: Types.ObjectId
  ): Promise<Event | null>;
  //   removeEventFromAllUsers(
  //     eventId: Types.ObjectId,
  //     options?: any
  //   ): Promise<void>;
}

export default class GroupEventRepository
  extends BaseRepository<GroupEvent, GroupEventDocument>
  implements IGroupEventRepository
{
  private groupEventModel: Model<GroupEventDocument>;

  constructor(groupEventModel: Model<GroupEventDocument>) {
    super(groupEventModel);
    this.groupEventModel = groupEventModel;
  }

  toEntity(doc: GroupEventDocument): GroupEvent {
    return GroupEvent.builder()
      .setId(doc._id as Types.ObjectId)
      .setGroupId(doc.groupId as Types.ObjectId)
      .setEvents(doc.events as Types.ObjectId[])
      .setCreatedAt(doc.createdAt)
      .setUpdatedAt(doc.updatedAt)
      .build();
  }

  //   toResponse(entity: UserEventDetails): UserEventResponse {
  //     return {
  //       event: {
  //         id: entity.getEvent().getId().toString(),
  //         title: entity.getEvent().getTitle(),
  //         admin: entity
  //           .getEvent()
  //           .getAdmin()
  //           .map((id) => id.toString()),
  //         invitees:
  //           entity
  //             .getEvent()
  //             .getInvitees()
  //             ?.map((id) => id.toString()) || [],
  //         startTime: entity.getEvent().getStartTime(),
  //         endTime: entity.getEvent().getEndTime() || new Date(),
  //         location: entity.getEvent().getLocation() || "",
  //         description: entity.getEvent().getDescription() || "",
  //         alerts: entity.getEvent().getAlerts() || [],
  //         tags: entity.getEvent().getTags() || [],
  //       },
  //       status: entity.getStatus(),
  //     };
  //   }

  //   async findByUserId(userId: Types.ObjectId): Promise<UserEvent[]> {
  //     const documents = await this.userEventModel.find({ userId });
  //     return documents.map((doc) => this.toEntity(doc));
  //   }

  async getGroupEvents(groupId: Types.ObjectId): Promise<Event[]> {
    const pipeline = [
      { $match: { groupId } },

      // Unwind the events array to work with individual event IDs
      { $unwind: "$events" },

      // Lookup event details from the events collection
      {
        $lookup: {
          from: "events", // Collection name for events
          localField: "events", // This is the event ID from the unwound array
          foreignField: "_id",
          as: "eventDetails",
        },
      },

      // Unwind the eventDetails array (should only have one element)
      { $unwind: "$eventDetails" },

      // Replace the root with just the event details
      { $replaceRoot: { newRoot: "$eventDetails" } },
    ];

    const results = await this.groupEventModel.aggregate(pipeline);

    // Convert aggregation results to Event entities
    return results.map((eventDoc) => {
      return Event.builder()
        .setId(eventDoc._id)
        .setTitle(eventDoc.title)
        .setAdmin(eventDoc.admin)
        .setInvitees(eventDoc.invitees)
        .setStartTime(eventDoc.startTime)
        .setEndTime(eventDoc.endTime)
        .setLocation(eventDoc.location)
        .setDescription(eventDoc.description)
        .setAlerts(eventDoc.alerts)
        .setTags(eventDoc.tags)
        .setCreatedAt(eventDoc.createdAt)
        .setUpdatedAt(eventDoc.updatedAt)
        .build();
    });
  }

  //   async getUserEventWithDetails(
  //     userId: Types.ObjectId,
  //     eventId: Types.ObjectId
  //   ): Promise<UserEventDetails | null> {
  //     const pipeline = [
  //       // Match user events for the specific user
  //       { $match: { userId } },

  //       // Unwind the events array to work with individual events
  //       { $unwind: "$events" },

  //       // Match the specific event
  //       { $match: { "events.eventId": eventId } },

  //       // Lookup event details from the events collection
  //       {
  //         $lookup: {
  //           from: "events",
  //           localField: "events.eventId",
  //           foreignField: "_id",
  //           as: "eventDetails",
  //         },
  //       },

  //       // Unwind the eventDetails array (should only have one element)
  //       { $unwind: "$eventDetails" },

  //       // Project the final structure
  //       {
  //         $project: {
  //           _id: 0,
  //           event: {
  //             id: "$eventDetails._id",
  //             title: "$eventDetails.title",
  //             admin: "$eventDetails.admin",
  //             invitees: "$eventDetails.invitees",
  //             startTime: "$eventDetails.startTime",
  //             endTime: "$eventDetails.endTime",
  //             location: "$eventDetails.location",
  //             description: "$eventDetails.description",
  //             alerts: "$eventDetails.alerts",
  //             tags: "$eventDetails.tags",
  //           },
  //           status: "$events.status",
  //         },
  //       },

  //       // Limit to first result since we're looking for a specific event
  //       { $limit: 1 },
  //     ];

  //     const results = await this.userEventModel.aggregate(pipeline);

  //     if (results.length === 0) {
  //       return null;
  //     }

  //     const result = results[0];

  //     // Convert aggregation result to UserEventDetails entity
  //     const event = Event.builder()
  //       .setId(result.event.id)
  //       .setTitle(result.event.title)
  //       .setAdmin(result.event.admin)
  //       .setInvitees(result.event.invitees)
  //       .setStartTime(result.event.startTime)
  //       .setEndTime(result.event.endTime)
  //       .setLocation(result.event.location)
  //       .setDescription(result.event.description)
  //       .setAlerts(result.event.alerts)
  //       .setTags(result.event.tags)
  //       .build();

  //     return UserEventDetails.builder()
  //       .setEvent(event)
  //       .setStatus(result.status)
  //       .build();
  //   }

  //   async findUserEventsByStatus(
  //     userId: Types.ObjectId,
  //     status: EventStatus
  //   ): Promise<UserEvent[]> {
  //     const documents = await this.userEventModel.find({
  //       userId,
  //       "events.status": status,
  //     });
  //     return documents.map((doc) => this.toEntity(doc));
  //   }

  //   async findUserEventsByEventId(eventId: Types.ObjectId): Promise<UserEvent[]> {
  //     const documents = await this.userEventModel.find({
  //       "events.eventId": eventId,
  //     });
  //     return documents.map((doc) => this.toEntity(doc));
  //   }

  //   async findUsersByEventAndStatus(
  //     eventId: Types.ObjectId,
  //     status: EventStatus
  //   ): Promise<UserEvent[]> {
  //     const documents = await this.userEventModel.find({
  //       "events.eventId": eventId,
  //       "events.status": status,
  //     });
  //     return documents.map((doc) => this.toEntity(doc));
  //   }

  //   async updateUserEventStatus(
  //     userId: Types.ObjectId,
  //     eventId: Types.ObjectId,
  //     status: EventStatus
  //   ): Promise<void> {
  //     await this.userEventModel.updateOne(
  //       {
  //         userId,
  //         "events.eventId": eventId,
  //       },
  //       {
  //         $set: {
  //           "events.$.status": status,
  //         },
  //       }
  //     );
  //   }

  async addEventToGroup(
    groupId: Types.ObjectId,
    eventId: Types.ObjectId
  ): Promise<void> {
    const existingGroupEvent = await this.groupEventModel.findOne({ groupId });

    if (existingGroupEvent) {
      await this.groupEventModel.updateOne(
        { groupId },
        {
          $push: { events: eventId },
        }
      );
    } else {
      await this.groupEventModel.create({
        groupId,
        events: [eventId],
      });
    }
  }

  async removeEventFromGroup(
    groupId: Types.ObjectId,
    eventId: Types.ObjectId,
    options?: any
  ): Promise<void> {
    await this.groupEventModel.updateOne(
      { groupId },
      { $pull: { events: eventId } },
      options
    );
  }

  //   async removeEventFromAllUsers(
  //     eventId: Types.ObjectId,
  //     options?: any
  //   ): Promise<void> {
  //     await this.groupEventModel.updateMany(
  //       { "events.eventId": eventId },
  //       { $pull: { events: { eventId } } },
  //       options
  //     );
  //   }

  async getGroupEventById(
    groupId: Types.ObjectId,
    eventId: Types.ObjectId
  ): Promise<Event | null> {
    const pipeline = [
      { $match: { groupId } },
      { $unwind: "$events" },
      { $match: { events: eventId } },
      {
        $lookup: {
          from: "events",
          localField: "events",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      { $unwind: "$eventDetails" },
      { $replaceRoot: { newRoot: "$eventDetails" } },
      { $limit: 1 },
    ];

    const results = await this.groupEventModel.aggregate(pipeline);

    if (results.length === 0) {
      return null;
    }

    const eventDoc = results[0];

    return Event.builder()
      .setId(eventDoc._id)
      .setTitle(eventDoc.title)
      .setAdmin(eventDoc.admin)
      .setInvitees(eventDoc.invitees)
      .setStartTime(eventDoc.startTime)
      .setEndTime(eventDoc.endTime)
      .setLocation(eventDoc.location)
      .setDescription(eventDoc.description)
      .setAlerts(eventDoc.alerts)
      .setTags(eventDoc.tags)
      .setCreatedAt(eventDoc.createdAt)
      .setUpdatedAt(eventDoc.updatedAt)
      .build();
  }
}
