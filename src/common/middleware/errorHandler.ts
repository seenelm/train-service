import { NextFunction, Request, Response } from "express";
import { Logger } from "../logger.js";
import { ServerError } from "../errors/ServerError.js";
import { APIError } from "../errors/APIError.js";
import { StatusCodes as HttpStatusCode } from "http-status-codes";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const logger = Logger.getInstance();
  const requestId =
    (req.headers["x-request-id"] as string) || "unknown-request-id";

  if (error instanceof ServerError) {
    const errorResponse = error.toErrorResponse(requestId);

    logger.error(`ServerError: ${error.message}`, {
      error: {
        name: error.name,
        message: error.message,
        errorCode: error.errorCode,
        statusCode: error.statusCode,
        details: error.details, // Full details for server logs
        stack: error.stack,
      },
      request: {
        id: requestId,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userId: req.user,
      },
    });

    return res.status(error.statusCode).json(errorResponse);
  }

  const unknownError = APIError.InternalServerError("Unknown error occurred");
  const errorResponse = unknownError.toErrorResponse(requestId);

  logger.error(`UnexpectedError: ${error.message}`, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    request: {
      id: requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userId: req.user,
    },
  });

  return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(errorResponse);
};
