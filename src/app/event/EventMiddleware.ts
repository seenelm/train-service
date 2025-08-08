import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { APIError } from "../../common/errors/APIError.js";
import {
  createEventSchema,
  updateEventSchema,
  updateUserEventStatusSchema,
} from "./EventSchema.js";
import { Types } from "mongoose";
import { IEventRepository } from "../../infrastructure/database/repositories/event/EventRepository.js";

export default class EventMiddleware {
  static validateCreateEvent = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validatedData = createEventSchema.parse(req.body);
      req.body = validatedData; // Overwrite req.body with validated data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage =
          (error as any).errors[0]?.message || "Invalid event data";
        next(APIError.BadRequest(errorMessage));
      } else {
        next(APIError.BadRequest("Invalid event data"));
      }
    }
  };

  static validateUpdateEvent = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validatedData = updateEventSchema.parse(req.body);
      req.body = validatedData; // Overwrite req.body with validated data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage =
          (error as any).errors[0]?.message || "Invalid event data";
        next(APIError.BadRequest(errorMessage));
      } else {
        next(APIError.BadRequest("Invalid event data"));
      }
    }
  };

  static checkEventOwnership = (eventRepository: IEventRepository) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const eventId = new Types.ObjectId(req.params.eventId);
        const userId = req.user.getId();

        // Find the event and check if user is an owner
        const event = await eventRepository.findById(eventId);

        if (!event) {
          return next(APIError.NotFound("Event not found"));
        }

        const isOwner = event
          .getAdmin()
          .some((adminId: Types.ObjectId) => adminId.equals(userId));

        if (!isOwner) {
          return next(
            APIError.Forbidden("Only event owners can update this event")
          );
        }

        // Attach the event to the request for use in the controller
        (req as any).event = event;
        next();
      } catch (error) {
        if (error instanceof APIError) {
          next(error);
        } else {
          next(
            APIError.InternalServerError("Failed to verify event ownership")
          );
        }
      }
    };
  };

  static validateUpdateUserEventStatus = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validatedData = updateUserEventStatusSchema.parse(req.body);
      req.body = validatedData; // Overwrite req.body with validated data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage =
          (error as any).errors[0]?.message || "Invalid user event status data";
        next(APIError.BadRequest(errorMessage));
      } else {
        next(APIError.BadRequest("Invalid user event status data"));
      }
    }
  };
}
