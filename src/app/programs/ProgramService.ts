import {
  ProgramRequest,
  ProgramResponse,
  WorkoutRequest,
  WorkoutResponse,
} from "@seenelm/train-core";
import { IProgramRepository } from "../../infrastructure/database/repositories/programs/ProgramRepository.js";
import { Logger } from "../../common/logger.js";
import { APIError } from "../../common/errors/APIError.js";
import { DatabaseError } from "../../common/errors/DatabaseError.js";
import { MongooseError, Types } from "mongoose";
import { MongoServerError } from "mongodb";
import { IWeekRepository } from "../../infrastructure/database/repositories/programs/WeekRepository.js";
import mongoose from "mongoose";
import { ClientSession } from "mongoose";

export interface IProgramService {
  createProgram(programRequest: ProgramRequest): Promise<ProgramResponse>;
  getUserPrograms(userId: Types.ObjectId): Promise<ProgramResponse[]>;
  createWorkout(
    weekId: Types.ObjectId,
    workoutRequest: WorkoutRequest
  ): Promise<WorkoutResponse>;
}

export default class ProgramService implements IProgramService {
  private programRepository: IProgramRepository;
  private weekRepository: IWeekRepository;
  private logger: Logger;

  constructor(
    programRepository: IProgramRepository,
    weekRepository: IWeekRepository
  ) {
    this.programRepository = programRepository;
    this.weekRepository = weekRepository;
    this.logger = Logger.getInstance();
  }

  public async createProgram(
    programRequest: ProgramRequest
  ): Promise<ProgramResponse> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      const programDocument = this.programRepository.toDocument(programRequest);

      const createdProgram = await this.programRepository.create(
        programDocument,
        { session }
      );

      const weekIds = await this.createWeekDocuments(
        createdProgram.getId(),
        programRequest.numWeeks,
        createdProgram.getCreatedAt() || new Date(),
        session
      );

      const updatedProgram = await this.programRepository.findByIdAndUpdate(
        createdProgram.getId(),
        { weeks: weekIds },
        { session }
      );

      if (!updatedProgram) {
        throw APIError.InternalServerError(
          "Failed to update program with weeks"
        );
      }

      await session.commitTransaction();

      const programResponse: ProgramResponse =
        this.programRepository.toResponse(updatedProgram);

      this.logger.info(
        "Program created successfully with weeks: ",
        programResponse
      );
      return programResponse;
    } catch (error) {
      this.logger.error("Error creating program: ", error);

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to create program");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  public async getUserPrograms(
    userId: Types.ObjectId
  ): Promise<ProgramResponse[]> {
    try {
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

  private async createWeekDocuments(
    programId: Types.ObjectId,
    numWeeks: number,
    programStartDate: Date,
    session: ClientSession
  ): Promise<Types.ObjectId[]> {
    const weekIds: Types.ObjectId[] = [];

    try {
      for (let weekNumber = 1; weekNumber <= numWeeks; weekNumber++) {
        // Calculate start and end dates for each week
        const weekStartDate = new Date(programStartDate);
        weekStartDate.setDate(weekStartDate.getDate() + (weekNumber - 1) * 7);

        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekEndDate.getDate() + 6); // 6 days after start date (7 days total)

        const weekDocument = {
          weekNumber,
          workouts: [],
          meals: [],
          notes: [],
          startDate: weekStartDate,
          endDate: weekEndDate,
        };

        const createdWeek = await this.weekRepository.create(weekDocument, {
          session,
        });
        weekIds.push(createdWeek.getId());

        this.logger.info(
          `Created week ${weekNumber} for program ${programId}: ${weekStartDate.toISOString()} - ${weekEndDate.toISOString()}`
        );
      }

      return weekIds;
    } catch (error) {
      this.logger.error("Error creating week documents: ", error);
      throw error;
    }
  }

  public async createWorkout(
    weekId: Types.ObjectId,
    workoutRequest: WorkoutRequest
  ): Promise<WorkoutResponse> {
    try {
      const workout = await this.weekRepository.createWorkout(
        weekId,
        workoutRequest
      );

      if (!workout) {
        throw APIError.NotFound("Week not found");
      }

      return this.weekRepository.toWorkoutResponse(workout);
    } catch (error) {
      this.logger.error("Error creating workout: ", error);

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to create workout");
      }
    }
  }
}
