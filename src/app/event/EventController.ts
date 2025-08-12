import { NextFunction, Request, Response } from "express";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { IEventService } from "./EventService.js";
import {
  EventRequest,
  UserEventResponse,
  UserEventRequest,
  CursorPaginationRequest,
} from "@seenelm/train-core";
import { Types } from "mongoose";

export default class EventController {
  private eventService: IEventService;

  constructor(eventService: IEventService) {
    this.eventService = eventService;
  }

  public addEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const createEventRequest: EventRequest = req.body;
      const groupId = new Types.ObjectId(req.params.groupId);

      const event = await this.eventService.addEvent(
        createEventRequest,
        groupId
      );

      res.status(HttpStatusCode.CREATED).json(event);
    } catch (error) {
      next(error);
    }
  };

  public getUserEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = new Types.ObjectId(req.params.userId);

      // Extract pagination parameters from query
      const limit = parseInt(req.query.limit as string) || 10;
      const cursor = req.query.cursor as string;

      const pagination: CursorPaginationRequest = {
        limit: Math.min(limit, 50), // Cap at 50 events per request
        cursor,
      };

      const result = await this.eventService.getUserEvents(userId, pagination);

      res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getUserEventById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.getId();
      const eventId = new Types.ObjectId(req.params.eventId);
      const userEvent: UserEventResponse =
        await this.eventService.getUserEventById(userId, eventId);

      res.status(HttpStatusCode.OK).json(userEvent);
    } catch (error) {
      next(error);
    }
  };

  public updateEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const eventId = new Types.ObjectId(req.params.eventId);
      const updateRequest = req.body as EventRequest;
      await this.eventService.updateEvent(eventId, updateRequest);

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public updateUserEventStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.getId();
      const updateRequest = req.body as UserEventRequest;
      await this.eventService.updateUserEventStatus(userId, updateRequest);

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public deleteEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const eventId = new Types.ObjectId(req.params.eventId);
      const groupId = new Types.ObjectId(req.params.groupId);
      await this.eventService.deleteEvent(eventId, groupId);

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public deleteUserEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user.getId();
      const eventId = new Types.ObjectId(req.params.eventId);
      await this.eventService.deleteUserEvent(userId, eventId);

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public removeUserFromEvent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const adminId = req.user.getId();
      const userId = new Types.ObjectId(req.params.userId);
      const eventId = new Types.ObjectId(req.params.eventId);
      await this.eventService.removeUserFromEvent(adminId, userId, eventId);

      res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public getGroupEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupId = new Types.ObjectId(req.params.groupId);
      const events = await this.eventService.getGroupEvents(groupId);

      res.status(HttpStatusCode.OK).json(events);
    } catch (error) {
      next(error);
    }
  };

  public getGroupEventById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const groupId = new Types.ObjectId(req.params.groupId);
      const eventId = new Types.ObjectId(req.params.eventId);
      const event = await this.eventService.getGroupEventById(groupId, eventId);

      res.status(HttpStatusCode.OK).json(event);
    } catch (error) {
      next(error);
    }
  };
}
