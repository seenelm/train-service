import { EventDocument, Alert } from "../../models/events/eventModel.js";
import Event from "../../entity/event/Event.js";
import { IBaseRepository, BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";
import { EventRequest, EventResponse } from "@seenelm/train-core";

export interface IEventRepository
  extends IBaseRepository<Event, EventDocument> {
  toDocument(request: EventRequest): Partial<EventDocument>;
  toResponse(event: Event): EventResponse;
  findByIds(eventIds: Types.ObjectId[]): Promise<Event[]>;
  findEventsByAdmin(adminId: Types.ObjectId): Promise<Event[]>;
  findEventsByInvitee(inviteeId: Types.ObjectId): Promise<Event[]>;
  findUpcomingEvents(limit?: number): Promise<Event[]>;
  findEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]>;
}

export default class EventRepository
  extends BaseRepository<Event, EventDocument>
  implements IEventRepository
{
  private eventModel: Model<EventDocument>;

  constructor(eventModel: Model<EventDocument>) {
    super(eventModel);
    this.eventModel = eventModel;
  }

  toEntity(doc: EventDocument): Event {
    return Event.builder()
      .setId(doc._id as Types.ObjectId)
      .setName(doc.name)
      .setAdmin(doc.admin as Types.ObjectId[])
      .setInvitees(doc.invitees as Types.ObjectId[])
      .setStartTime(doc.startTime)
      .setEndTime(doc.endTime)
      .setLocation(doc.location)
      .setDescription(doc.description)
      .setAlerts(doc.alerts as Alert[])
      .setCreatedAt(doc.createdAt)
      .setUpdatedAt(doc.updatedAt)
      .build();
  }

  toDocument(request: EventRequest): Partial<EventDocument> {
    return {
      name: request.name,
      admin: request.admin.map((id) => new Types.ObjectId(id)),
      invitees: request.invitees?.map((id) => new Types.ObjectId(id)) || [],
      startTime: request.startTime,
      endTime: request.endTime,
      location: request.location,
      description: request.description,
      alerts: request.alerts,
    };
  }

  toResponse(event: Event): EventResponse {
    return {
      id: event.getId().toString(),
      name: event.getName(),
      admin: event.getAdmin().map((id) => id.toString()),
      invitees: event.getInvitees()?.map((id) => id.toString()),
      startTime: event.getStartTime(),
      endTime: event.getEndTime(),
      location: event.getLocation(),
      description: event.getDescription(),
      alerts: event.getAlerts(),
    };
  }

  async findByIds(eventIds: Types.ObjectId[]): Promise<Event[]> {
    const documents = await this.eventModel.find({
      _id: { $in: eventIds },
    });
    return documents.map((doc) => this.toEntity(doc));
  }

  async findEventsByAdmin(adminId: Types.ObjectId): Promise<Event[]> {
    const documents = await this.eventModel.find({
      admin: adminId,
    });
    return documents.map((doc) => this.toEntity(doc));
  }

  async findEventsByInvitee(inviteeId: Types.ObjectId): Promise<Event[]> {
    const documents = await this.eventModel.find({
      invitees: inviteeId,
    });
    return documents.map((doc) => this.toEntity(doc));
  }

  async findUpcomingEvents(limit: number = 10): Promise<Event[]> {
    const now = new Date();
    const documents = await this.eventModel
      .find({
        startTime: { $gte: now },
      })
      .sort({ startTime: 1 })
      .limit(limit);
    return documents.map((doc) => this.toEntity(doc));
  }

  async findEventsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Event[]> {
    const documents = await this.eventModel.find({
      startTime: { $gte: startDate, $lte: endDate },
    });
    return documents.map((doc) => this.toEntity(doc));
  }
}
