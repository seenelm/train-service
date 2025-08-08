import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { APIError } from "../../common/errors/APIError.js";
import { createEventSchema } from "./EventSchema.js";

export default class EventMiddleware {
  static validateCreateEvent = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validatedData = createEventSchema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || "Invalid event data";
        next(APIError.BadRequest(errorMessage));
      } else {
        next(APIError.BadRequest("Invalid event data"));
      }
    }
  };
}
