import { GroupEventDocument } from "../../models/events/groupEventModel.js";
import GroupEvent from "../../entity/event/GroupEvent.js";
import Event from "../../entity/event/Event.js";
import { IBaseRepository, BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";

export interface IGroupEventRepository
  extends IBaseRepository<GroupEvent, GroupEventDocument> {
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
