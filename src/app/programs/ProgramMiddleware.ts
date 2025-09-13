import { Request, Response, NextFunction } from "express";
import { createProgramSchema } from "./ProgramSchema.js";
import { Logger } from "../../common/logger.js";
import { ValidationErrorResponse } from "../../common/errors/ValidationErrorResponse.js";
import { StatusCodes as HttpStatusCode } from "http-status-codes";

export default class ProgramMiddleware {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  static validateCreateProgram = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = createProgramSchema.safeParse(req.body);
      if (!result.success) {
        const validationErrors = ValidationErrorResponse.fromZodError(
          result.error
        );
        return res.status(HttpStatusCode.BAD_REQUEST).json({
          message: "Create program validation failed",
          errors: validationErrors.map((error) => error.toJSON()),
        });
      }
      req.body = result;
      next();
    } catch (error) {
      next(error);
    }
  };
}
