import { EventDocument, Alert } from "../../models/events/eventModel.js";
import Event from "../../entity/event/Event.js";
import { IBaseRepository, BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";
import { EventRequest, EventResponse } from "@seenelm/train-core";

export interface IEventRepository
  extends IBaseRepository<Event, EventDocument> {
  toDocument(request: EventRequest): Partial<EventDocument>;
  toResponse(event: Event): EventResponse;
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
      .setTitle(doc.title)
      .setAdmin(doc.admin as Types.ObjectId[])
      .setInvitees(doc.invitees as Types.ObjectId[])
      .setStartTime(doc.startTime)
      .setEndTime(doc.endTime)
      .setLocation(doc.location)
      .setDescription(doc.description)
      .setAlerts(doc.alerts as Alert[])
      .setTags(doc.tags)
      .setCreatedAt(doc.createdAt)
      .setUpdatedAt(doc.updatedAt)
      .build();
  }

  toDocument(request: EventRequest): Partial<EventDocument> {
    return {
      title: request.title,
      admin: request.admin.map((id) => new Types.ObjectId(id)),
      invitees: request.invitees?.map((id) => new Types.ObjectId(id)) || [],
      startTime: request.startTime,
      endTime: request.endTime,
      location: request.location,
      description: request.description,
      alerts: request.alerts,
      tags: request.tags,
    };
  }

  toResponse(event: Event): EventResponse {
    return {
      id: event.getId().toString(),
      title: event.getTitle(),
      admin: event.getAdmin().map((id) => id.toString()),
      invitees: event.getInvitees()?.map((id) => id.toString()) || [],
      startTime: event.getStartTime(),
      endTime: event.getEndTime() || new Date(),
      location: event.getLocation() || "",
      description: event.getDescription() || "",
      alerts: event.getAlerts() || [],
      tags: event.getTags() || [],
    };
  }
}
