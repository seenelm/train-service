import { NextFunction, Request, Response } from "express";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { IEventService } from "./EventService.js";
import { EventRequest, UserEventResponse } from "@seenelm/train-core";
import { Types } from "mongoose";

export default class EventController {
  private eventService: IEventService;

  constructor(eventService: IEventService) {
    this.eventService = eventService;
  }

  public addEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const createEventRequest: EventRequest = req.body;
      const event = await this.eventService.addEvent(createEventRequest);

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
      const userEvents: UserEventResponse[] =
        await this.eventService.getUserEvents(userId);

      res.status(HttpStatusCode.OK).json(userEvents);
    } catch (error) {
      next(error);
    }
  };
}
