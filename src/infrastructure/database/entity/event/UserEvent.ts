import { Types } from "mongoose";
import { EventStatus } from "../../../../common/enums.js";

interface EventEntry {
  eventId: Types.ObjectId;
  status: EventStatus;
}

export default class UserEvent {
  private id: Types.ObjectId;
  private userId: Types.ObjectId;
  private events: EventEntry[];
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(builder: UserEventBuilder) {
    this.id = builder.id;
    this.userId = builder.userId;
    this.events = builder.events;
    this.createdAt = builder.createdAt;
    this.updatedAt = builder.updatedAt;
  }

  static builder(): UserEventBuilder {
    return new UserEventBuilder();
  }

  public getId(): Types.ObjectId {
    return this.id;
  }

  public getUserId(): Types.ObjectId {
    return this.userId;
  }

  public getEvents(): EventEntry[] {
    return this.events;
  }

  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  public setId(id: Types.ObjectId): void {
    this.id = id;
  }

  public setUserId(userId: Types.ObjectId): void {
    this.userId = userId;
  }

  public setEvents(events: EventEntry[]): void {
    this.events = events;
  }

  public setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  public setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }

  public addEvent(
    eventId: Types.ObjectId,
    status: EventStatus = EventStatus.Pending
  ): void {
    const existingEventIndex = this.events.findIndex((event) =>
      event.eventId.equals(eventId)
    );

    if (existingEventIndex >= 0) {
      // Update existing event status
      this.events[existingEventIndex].status = status;
    } else {
      // Add new event
      this.events.push({ eventId, status });
    }
  }

  public removeEvent(eventId: Types.ObjectId): void {
    this.events = this.events.filter((event) => !event.eventId.equals(eventId));
  }

  public updateEventStatus(eventId: Types.ObjectId, status: EventStatus): void {
    const event = this.events.find((event) => event.eventId.equals(eventId));
    if (event) {
      event.status = status;
    }
  }

  public getEventStatus(eventId: Types.ObjectId): EventStatus | undefined {
    const event = this.events.find((event) => event.eventId.equals(eventId));
    return event?.status;
  }

  public hasEvent(eventId: Types.ObjectId): boolean {
    return this.events.some((event) => event.eventId.equals(eventId));
  }

  public getEventsByStatus(status: EventStatus): EventEntry[] {
    return this.events.filter((event) => event.status === status);
  }

  public getPendingEvents(): EventEntry[] {
    return this.getEventsByStatus(EventStatus.Pending);
  }

  public getAcceptedEvents(): EventEntry[] {
    return this.getEventsByStatus(EventStatus.Accepted);
  }

  public getRejectedEvents(): EventEntry[] {
    return this.getEventsByStatus(EventStatus.Rejected);
  }
}

class UserEventBuilder {
  id: Types.ObjectId = new Types.ObjectId();
  userId: Types.ObjectId = new Types.ObjectId();
  events: EventEntry[] = [];
  createdAt?: Date;
  updatedAt?: Date;

  public setId(id: Types.ObjectId): this {
    this.id = id;
    return this;
  }

  public setUserId(userId: Types.ObjectId): this {
    this.userId = userId;
    return this;
  }

  public setEvents(events: EventEntry[]): this {
    this.events = events;
    return this;
  }

  public setCreatedAt(createdAt?: Date): this {
    this.createdAt = createdAt;
    return this;
  }

  public setUpdatedAt(updatedAt?: Date): this {
    this.updatedAt = updatedAt;
    return this;
  }

  public build(): UserEvent {
    return new UserEvent(this);
  }
}
