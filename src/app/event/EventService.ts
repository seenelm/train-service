import { Types } from "mongoose";
import { IEventRepository } from "../../infrastructure/database/repositories/event/EventRepository.js";
import { IUserEventRepository } from "../../infrastructure/database/repositories/event/UserEventRepository.js";
import Event from "../../infrastructure/database/entity/event/Event.js";
import UserEvent from "../../infrastructure/database/entity/event/UserEvent.js";
import { EventStatus } from "../../common/enums.js";
import { APIError } from "../../common/errors/APIError.js";
import { DatabaseError } from "../../common/errors/DatabaseError.js";
import { MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";
import { Logger } from "../../common/logger.js";
import {
  EventRequest,
  EventResponse,
  UserEventResponse,
} from "@seenelm/train-core";
import mongoose from "mongoose";

export interface IEventService {
  addEvent(request: EventRequest): Promise<EventResponse>;
  getUserEvents(userId: Types.ObjectId): Promise<UserEventResponse[]>;
}

export default class EventService implements IEventService {
  private eventRepository: IEventRepository;
  private userEventRepository: IUserEventRepository;
  private logger: Logger;

  constructor(
    eventRepository: IEventRepository,
    userEventRepository: IUserEventRepository
  ) {
    this.eventRepository = eventRepository;
    this.userEventRepository = userEventRepository;
    this.logger = Logger.getInstance();
  }

  async addEvent(request: EventRequest): Promise<EventResponse> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const eventDoc = this.eventRepository.toDocument(request);
      const event = await this.eventRepository.create(eventDoc);

      // Add event to all admins' userEvents with Accepted status
      const adminPromises = event
        .getAdmin()
        .map((adminId: Types.ObjectId) =>
          this.userEventRepository.addEventToUser(
            adminId,
            event.getId(),
            EventStatus.Accepted
          )
        );

      // Add event to all invitees' userEvents with Pending status
      const inviteePromises =
        event
          .getInvitees()
          ?.map((inviteeId: Types.ObjectId) =>
            this.userEventRepository.addEventToUser(
              inviteeId,
              event.getId(),
              EventStatus.Pending
            )
          ) || [];

      // Wait for all userEvent updates to complete
      await Promise.all([...adminPromises, ...inviteePromises]);

      await session.commitTransaction();

      this.logger.info("Event created successfully", {
        eventId: event.getId().toString(),
        name: event.getName(),
        adminCount: event.getAdmin().length,
        inviteeCount: event.getInvitees()?.length || 0,
      });

      return this.eventRepository.toResponse(event);
    } catch (error) {
      this.logger.error("Failed to create event", {
        error: error instanceof Error ? error.message : "Unknown error",
        request,
      });

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to create event");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getUserEvents(userId: Types.ObjectId): Promise<UserEventResponse[]> {
    try {
      // Get user's events from UserEventRepository
      const userEvents = await this.userEventRepository.findByUserId(userId);

      if (!userEvents || userEvents.length === 0) {
        return [];
      }

      // Get all event IDs from user events
      const eventIds = userEvents.flatMap((userEvent: UserEvent) =>
        userEvent
          .getEvents()
          .map(
            (event: { eventId: Types.ObjectId; status: EventStatus }) =>
              event.eventId
          )
      );

      // Fetch all events in one query
      const events = await this.eventRepository.findByIds(eventIds);

      // Create a map for quick lookup
      const eventMap = new Map(
        events.map((event: Event) => [event.getId().toString(), event])
      );

      // Build UserEventResponse array
      const userEventResponses: UserEventResponse[] = [];

      for (const userEvent of userEvents) {
        for (const eventEntry of userEvent.getEvents()) {
          const event = eventMap.get(eventEntry.eventId.toString());
          if (event) {
            userEventResponses.push({
              event: this.eventRepository.toResponse(event),
              status: eventEntry.status,
            });
          }
        }
      }

      this.logger.info("User events retrieved successfully", {
        userId: userId.toString(),
        eventCount: userEventResponses.length,
      });

      return userEventResponses;
    } catch (error) {
      this.logger.error("Failed to get user events", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: userId.toString(),
      });

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to get user events");
      }
    }
  }
}
