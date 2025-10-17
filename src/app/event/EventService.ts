import { Types } from "mongoose";
import { IEventRepository } from "../../infrastructure/database/repositories/event/EventRepository.js";
import { IUserEventRepository } from "../../infrastructure/database/repositories/event/UserEventRepository.js";
import UserEventDetails from "../../infrastructure/database/entity/event/UserEventDetails.js";
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
  UserEventRequest,
  CursorPaginationRequest,
  CursorPaginationResponse,
} from "@seenelm/train-core";
import mongoose from "mongoose";
import { IGroupEventRepository } from "../../infrastructure/database/repositories/event/GroupEventRepository.js";

export interface IEventService {
  createGroupEvent(
    request: EventRequest,
    groupId: Types.ObjectId
  ): Promise<EventResponse>;
  createEvent(
    request: EventRequest,
    userId: Types.ObjectId
  ): Promise<EventResponse>;
  getUserEvents(
    userId: Types.ObjectId,
    pagination: CursorPaginationRequest
  ): Promise<CursorPaginationResponse<UserEventResponse>>;
  getUserEventById(
    userId: Types.ObjectId,
    eventId: Types.ObjectId
  ): Promise<UserEventResponse>;
  updateEvent(eventId: Types.ObjectId, request: EventRequest): Promise<void>;
  updateUserEventStatus(
    userId: Types.ObjectId,
    request: UserEventRequest
  ): Promise<void>;
  deleteEvent(eventId: Types.ObjectId, groupId: Types.ObjectId): Promise<void>;
  deleteUserEvent(
    userId: Types.ObjectId,
    eventId: Types.ObjectId
  ): Promise<void>;
  removeUserFromEvent(
    adminId: Types.ObjectId,
    userId: Types.ObjectId,
    eventId: Types.ObjectId
  ): Promise<void>;
  getGroupEvents(groupId: Types.ObjectId): Promise<EventResponse[]>;
}

export default class EventService implements IEventService {
  private eventRepository: IEventRepository;
  private userEventRepository: IUserEventRepository;
  private groupEventRepository: IGroupEventRepository;
  private logger: Logger;

  constructor(
    eventRepository: IEventRepository,
    userEventRepository: IUserEventRepository,
    groupEventRepository: IGroupEventRepository
  ) {
    this.eventRepository = eventRepository;
    this.userEventRepository = userEventRepository;
    this.groupEventRepository = groupEventRepository;
    this.logger = Logger.getInstance();
  }

  async createGroupEvent(
    request: EventRequest,
    groupId: Types.ObjectId
  ): Promise<EventResponse> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const eventDoc = this.eventRepository.toDocument(request);
      const event = await this.eventRepository.create(eventDoc);

      await this.groupEventRepository.addEventToGroup(groupId, event.getId());

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
        title: event.getTitle(),
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

  async createEvent(
    request: EventRequest,
    userId: Types.ObjectId
  ): Promise<EventResponse> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Create the event document
      const eventDoc = this.eventRepository.toDocument(request);
      const event = await this.eventRepository.create(eventDoc);

      // Add the event to the user's userEvents collection with Accepted status
      await this.userEventRepository.addEventToUser(
        userId,
        event.getId(),
        EventStatus.Accepted
      );

      // If there are invitees, add the event to their userEvents with Pending status
      if (request.invitees && request.invitees.length > 0) {
        const inviteePromises = request.invitees.map((inviteeId: string) =>
          this.userEventRepository.addEventToUser(
            new Types.ObjectId(inviteeId),
            event.getId(),
            EventStatus.Pending
          )
        );

        await Promise.all(inviteePromises);
      }

      await session.commitTransaction();

      this.logger.info("User event created successfully", {
        eventId: event.getId().toString(),
        title: event.getTitle(),
        userId: userId.toString(),
        inviteeCount: request.invitees?.length || 0,
      });

      return this.eventRepository.toResponse(event);
    } catch (error) {
      this.logger.error("Failed to create user event", {
        error: error instanceof Error ? error.message : "Unknown error",
        request,
        userId: userId.toString(),
      });

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to create user event");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getUserEvents(
    userId: Types.ObjectId,
    pagination: CursorPaginationRequest
  ): Promise<CursorPaginationResponse<UserEventResponse>> {
    try {
      const { limit, cursor } = pagination;

      const result =
        await this.userEventRepository.getUserEventsWithDetailsPaginated(
          userId,
          limit,
          cursor
        );

      if (!result || result.data.length === 0) {
        return {
          data: [],
          pagination: {
            hasNextPage: false,
            hasPreviousPage: false,
            nextCursor: undefined,
            previousCursor: undefined,
          },
        };
      }

      const userEventResponses: UserEventResponse[] = result.data.map(
        (userEventDetail: UserEventDetails) => {
          return this.userEventRepository.toResponse(userEventDetail);
        }
      );

      this.logger.info("User events retrieved successfully", {
        userId: userId.toString(),
        eventCount: userEventResponses.length,
        hasNextPage: result.pagination.hasNextPage,
        nextCursor: result.pagination.nextCursor,
      });

      return {
        data: userEventResponses,
        pagination: result.pagination,
      };
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

  async getUserEventById(
    userId: Types.ObjectId,
    eventId: Types.ObjectId
  ): Promise<UserEventResponse> {
    try {
      const userEventWithDetails =
        await this.userEventRepository.getUserEventWithDetails(userId, eventId);

      if (!userEventWithDetails) {
        this.logger.warn("User event not found", {
          userId: userId.toString(),
          eventId: eventId.toString(),
        });
        throw APIError.NotFound("User event not found");
      }

      this.logger.info("User event retrieved successfully", {
        userId: userId.toString(),
        eventId: eventId.toString(),
        status: userEventWithDetails.getStatus(),
      });

      return this.userEventRepository.toResponse(userEventWithDetails);
    } catch (error) {
      this.logger.error("Failed to get user event", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: userId.toString(),
        eventId: eventId.toString(),
      });

      if (error instanceof APIError) {
        throw error;
      } else if (
        error instanceof MongooseError ||
        error instanceof MongoServerError
      ) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to get user event");
      }
    }
  }

  async updateEvent(
    eventId: Types.ObjectId,
    request: EventRequest
  ): Promise<void> {
    try {
      const eventDoc = this.eventRepository.toDocument(request);

      await this.eventRepository.updateOne(
        { _id: eventId },
        { $set: eventDoc }
      );

      this.logger.info("Event updated successfully", {
        eventId: eventId.toString(),
        updatedFields: Object.keys(eventDoc),
      });
    } catch (error) {
      this.logger.error("Failed to update event", {
        error: error instanceof Error ? error.message : "Unknown error",
        eventId: eventId.toString(),
        request,
      });

      if (error instanceof APIError) {
        throw error;
      } else if (
        error instanceof MongooseError ||
        error instanceof MongoServerError
      ) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to update event");
      }
    }
  }

  async updateUserEventStatus(
    userId: Types.ObjectId,
    request: UserEventRequest
  ): Promise<void> {
    try {
      const eventId = new Types.ObjectId(request.eventId);

      await this.userEventRepository.updateUserEventStatus(
        userId,
        eventId,
        request.status
      );

      this.logger.info("User event status updated successfully", {
        userId: userId.toString(),
        eventId: eventId.toString(),
        status: request.status,
      });
    } catch (error) {
      this.logger.error("Failed to update user event status", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: userId.toString(),
        eventId: request.eventId,
        status: request.status,
      });

      if (error instanceof APIError) {
        throw error;
      } else if (
        error instanceof MongooseError ||
        error instanceof MongoServerError
      ) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError(
          "Failed to update user event status"
        );
      }
    }
  }

  async deleteEvent(
    eventId: Types.ObjectId,
    groupId: Types.ObjectId
  ): Promise<void> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await this.eventRepository.deleteOne({ _id: eventId }, { session });

      await this.groupEventRepository.removeEventFromGroup(groupId, eventId, {
        session,
      });

      await this.userEventRepository.removeEventFromAllUsers(eventId, {
        session,
      });

      await session.commitTransaction();

      this.logger.info("Event deleted successfully", {
        eventId: eventId.toString(),
      });
    } catch (error) {
      this.logger.error("Failed to delete event", {
        error: error instanceof Error ? error.message : "Unknown error",
        eventId: eventId.toString(),
      });

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof APIError) {
        throw error;
      } else if (
        error instanceof MongooseError ||
        error instanceof MongoServerError
      ) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to delete event");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async deleteUserEvent(
    userId: Types.ObjectId,
    eventId: Types.ObjectId
  ): Promise<void> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await this.userEventRepository.removeEventFromUser(userId, eventId, {
        session,
      });

      await this.eventRepository.updateOne(
        { _id: eventId },
        { $pull: { invitees: userId } },
        { session }
      );

      await session.commitTransaction();

      this.logger.info("User event deleted successfully", {
        userId: userId.toString(),
        eventId: eventId.toString(),
      });
    } catch (error) {
      this.logger.error("Failed to delete user event", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: userId.toString(),
        eventId: eventId.toString(),
      });

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof APIError) {
        throw error;
      } else if (
        error instanceof MongooseError ||
        error instanceof MongoServerError
      ) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to delete user event");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async removeUserFromEvent(
    adminId: Types.ObjectId,
    userId: Types.ObjectId,
    eventId: Types.ObjectId
  ): Promise<void> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      await this.userEventRepository.removeEventFromUser(userId, eventId, {
        session,
      });

      await this.eventRepository.updateOne(
        { _id: eventId },
        { $pull: { invitees: userId } },
        { session }
      );

      await session.commitTransaction();

      this.logger.info("User removed from event by admin successfully", {
        adminId: adminId.toString(),
        userId: userId.toString(),
        eventId: eventId.toString(),
      });
    } catch (error) {
      this.logger.error("Failed to remove user from event", {
        error: error instanceof Error ? error.message : "Unknown error",
        adminId: adminId.toString(),
        userId: userId.toString(),
        eventId: eventId.toString(),
      });

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof APIError) {
        throw error;
      } else if (
        error instanceof MongooseError ||
        error instanceof MongoServerError
      ) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to remove user from event");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getGroupEvents(groupId: Types.ObjectId): Promise<EventResponse[]> {
    try {
      const groupEvent = await this.groupEventRepository.findOne({
        groupId,
      });

      if (!groupEvent) {
        this.logger.warn("Group not found when trying to get events", {
          groupId: groupId.toString(),
        });
        throw APIError.NotFound("Group not found");
      }

      if (!groupEvent.getEvents() || groupEvent.getEvents().length === 0) {
        this.logger.info("Group found but has no events", {
          groupId: groupId.toString(),
        });
        return [];
      }

      const events = await this.groupEventRepository.getGroupEvents(groupId);

      const eventResponses: EventResponse[] = events.map((event) =>
        this.eventRepository.toResponse(event)
      );

      this.logger.info("Group events retrieved successfully", {
        groupId: groupId.toString(),
        eventCount: eventResponses.length,
      });

      return eventResponses;
    } catch (error) {
      this.logger.error("Failed to get group events", {
        error: error instanceof Error ? error.message : "Unknown error",
        groupId: groupId.toString(),
      });

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else if (error instanceof APIError) {
        throw error;
      } else {
        throw APIError.InternalServerError("Failed to get group events");
      }
    }
  }
}
