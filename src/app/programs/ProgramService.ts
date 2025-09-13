import { ProgramRequest, ProgramResponse } from "@seenelm/train-core";
import { IProgramRepository } from "../../infrastructure/database/repositories/programs/ProgramRepository.js";
import { Logger } from "../../common/logger.js";
import { APIError } from "../../common/errors/APIError.js";
import { DatabaseError } from "../../common/errors/DatabaseError.js";
import { MongooseError, Types } from "mongoose";
import { MongoServerError } from "mongodb";

export interface IProgramService {
  createProgram(programRequest: ProgramRequest): Promise<ProgramResponse>;
  getUserPrograms(userId: Types.ObjectId): Promise<ProgramResponse[]>;
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

  public async getUserPrograms(
    userId: Types.ObjectId
  ): Promise<ProgramResponse[]> {
    try {
      this.logger.info("Getting programs for user: ", userId);

      // Find all programs where the user is the creator
      const programs = await this.programRepository.find({ createdBy: userId });

      // Convert to response format
      const programResponses: ProgramResponse[] = programs.map((program) =>
        this.programRepository.toResponse(program)
      );

      this.logger.info(
        `Found ${programResponses.length} programs for user: `,
        userId
      );
      return programResponses;
    } catch (error) {
      this.logger.error("Error getting user programs: ", error);

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to get user programs");
      }
    }
  }
}
