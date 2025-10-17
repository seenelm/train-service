import { Types } from "mongoose";
import { EventStatus } from "../../../../common/enums.js";
import Event from "./Event.js";

export interface UserEventDetailsData {
  event: Event;
  status: EventStatus;
}

export default class UserEventDetails {
  private event: Event;
  private status: EventStatus;

  constructor(builder: UserEventDetailsBuilder) {
    this.event = builder.event;
    this.status = builder.status;
  }

  public getEvent(): Event {
    return this.event;
  }

  public getStatus(): EventStatus {
    return this.status;
  }

  public setEvent(event: Event): void {
    this.event = event;
  }

  public setStatus(status: EventStatus): void {
    this.status = status;
  }

  // Static builder pattern
  public static builder(): UserEventDetailsBuilder {
    return new UserEventDetailsBuilder();
  }
}

class UserEventDetailsBuilder {
  event: Event = Event.builder().build();
  status: EventStatus = EventStatus.Pending;

  public setEvent(event: Event): this {
    this.event = event;
    return this;
  }

  public setStatus(status: EventStatus): this {
    this.status = status;
    return this;
  }

  public build(): UserEventDetails {
    return new UserEventDetails(this);
  }
}
