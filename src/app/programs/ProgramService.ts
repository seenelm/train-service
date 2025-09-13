import { ProgramRequest, ProgramResponse } from "@seenelm/train-core";
import { IProgramRepository } from "../../infrastructure/database/repositories/programs/ProgramRepository.js";
import { Logger } from "../../common/logger.js";
import { APIError } from "../../common/errors/APIError.js";
import { DatabaseError } from "../../common/errors/DatabaseError.js";
import { MongooseError } from "mongoose";
import { MongoServerError } from "mongodb";

export interface IProgramService {
  createProgram(programRequest: ProgramRequest): Promise<ProgramResponse>;
}

export default class ProgramService implements IProgramService {
  private programRepository: IProgramRepository;
  private logger: Logger;

  constructor(programRepository: IProgramRepository) {
    this.programRepository = programRepository;
    this.logger = Logger.getInstance();
  }

  public async createProgram(
    programRequest: ProgramRequest
  ): Promise<ProgramResponse> {
    try {
      const programDocument = this.programRepository.toDocument(programRequest);
      const createdProgram = await this.programRepository.create(
        programDocument
      );

      const programResponse: ProgramResponse =
        this.programRepository.toResponse(createdProgram);

      this.logger.info("Program created successfully: ", programResponse);
      return programResponse;
    } catch (error) {
      this.logger.error("Error creating program: ", error);

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to create program");
      }
    }
  }
}
