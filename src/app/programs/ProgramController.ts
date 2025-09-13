import { NextFunction, Request, Response } from "express";
import { IProgramService } from "./ProgramService.js";
import { ProgramRequest, ProgramResponse } from "@seenelm/train-core";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { Logger } from "../../common/logger.js";

export default class ProgramController {
  private programService: IProgramService;
  private logger: Logger;

  constructor(programService: IProgramService) {
    this.programService = programService;
    this.logger = Logger.getInstance();
  }

  public createProgram = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const programRequest: ProgramRequest = req.body;
      this.logger.info("Program creation request: ", programRequest);

      const programResponse: ProgramResponse =
        await this.programService.createProgram(programRequest);

      return res.status(HttpStatusCode.CREATED).json(programResponse);
    } catch (error) {
      next(error);
    }
  };
}
