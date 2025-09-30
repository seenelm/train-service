import {
  ProgramRequest,
  ProgramResponse,
  WorkoutRequest,
  WorkoutResponse,
  MealRequest,
  MealResponse,
  WeekResponse,
  WorkoutLogRequest,
  WorkoutLogResponse,
  BlockLog,
  MealLogRequest,
  WeekRequest,
  NotesRequest,
  NotesResponse,
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
import { IMealRepository } from "../../infrastructure/database/repositories/programs/MealRepository.js";

export interface IProgramService {
  createProgram(programRequest: ProgramRequest): Promise<ProgramResponse>;
  getUserPrograms(userId: Types.ObjectId): Promise<ProgramResponse[]>;
  createWorkout(
    weekId: Types.ObjectId,
    workoutRequest: WorkoutRequest
  ): Promise<WorkoutResponse>;
  updateWorkout(
    weekId: Types.ObjectId,
    workoutId: Types.ObjectId,
    workoutRequest: WorkoutRequest
  ): Promise<void>;
  deleteWorkout(
    weekId: Types.ObjectId,
    workoutId: Types.ObjectId
  ): Promise<void>;
  createMeal(
    weekId: Types.ObjectId,
    mealRequest: MealRequest
  ): Promise<MealResponse>;
  updateMeal(
    weekId: Types.ObjectId,
    mealId: Types.ObjectId,
    mealRequest: MealRequest
  ): Promise<void>;
  deleteMeal(weekId: Types.ObjectId, mealId: Types.ObjectId): Promise<void>;
  createWorkoutLog(
    weekId: Types.ObjectId,
    workoutLogRequest: WorkoutLogRequest
  ): Promise<WorkoutLogResponse>;
  addBlockLog(
    weekId: Types.ObjectId,
    workoutLogId: Types.ObjectId,
    blockLog: BlockLog
  ): Promise<void>;
  addMealLog(mealLogRequest: MealLogRequest): Promise<void>;
  getWeekWorkouts(weekId: Types.ObjectId): Promise<WorkoutResponse[]>;
  getWeekMeals(weekId: Types.ObjectId): Promise<MealResponse[]>;
  getWeek(weekId: Types.ObjectId): Promise<WeekResponse>;
  updateWeek(weekId: Types.ObjectId, weekRequest: WeekRequest): Promise<void>;
  deleteWeek(programId: Types.ObjectId, weekId: Types.ObjectId): Promise<void>;
  createNote(
    weekId: Types.ObjectId,
    noteRequest: NotesRequest
  ): Promise<NotesResponse>;
  updateNote(
    weekId: Types.ObjectId,
    noteId: Types.ObjectId,
    noteRequest: NotesRequest
  ): Promise<void>;
  deleteNote(weekId: Types.ObjectId, noteId: Types.ObjectId): Promise<void>;
}

export default class ProgramService implements IProgramService {
  private programRepository: IProgramRepository;
  private weekRepository: IWeekRepository;
  private mealRepository: IMealRepository;
  private logger: Logger;

  constructor(
    programRepository: IProgramRepository,
    weekRepository: IWeekRepository,
    mealRepository: IMealRepository
  ) {
    this.programRepository = programRepository;
    this.weekRepository = weekRepository;
    this.mealRepository = mealRepository;
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
      const programsWithWeeks =
        await this.programRepository.getUserProgramsWithWeeks(userId);

      if (!programsWithWeeks) {
        throw APIError.NotFound("No programs with weeks found for user");
      }

      const programResponses: ProgramResponse[] = programsWithWeeks.map(
        (program) => this.programRepository.toResponseWithWeeks(program)
      );

      this.logger.info(
        `Found ${programResponses.length} programs with week details for user: `,
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

  public async updateWorkout(
    weekId: Types.ObjectId,
    workoutId: Types.ObjectId,
    workoutRequest: WorkoutRequest
  ): Promise<void> {
    try {
      const week = await this.weekRepository.findById(weekId);

      if (!week) {
        throw APIError.NotFound("Week not found");
      }

      const workout = week
        .getWorkouts()
        .find((w) => w._id?.toString() === workoutId.toString());

      if (!workout) {
        throw APIError.NotFound("Workout not found");
      }

      const updatedWorkoutDocument = {
        ...workoutRequest,
        createdBy: new Types.ObjectId(workoutRequest.createdBy),
        versionId: workout.versionId + 1,
        blocks: workoutRequest.blocks || [],
      };

      await this.weekRepository.updateOne(
        {
          _id: weekId,
          "workouts._id": workoutId,
        },
        {
          $set: { workouts: updatedWorkoutDocument },
        }
      );
    } catch (error) {
      this.logger.error("Error updating workout: ", error);

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to update workout");
      }
    }
  }
  public async deleteWorkout(
    weekId: Types.ObjectId,
    workoutId: Types.ObjectId
  ): Promise<void> {
    try {
      const week = await this.weekRepository.findById(weekId);

      if (!week) {
        throw APIError.NotFound("Week not found");
      }

      const workout = week
        .getWorkouts()
        .find((w) => w._id?.toString() === workoutId.toString());

      if (!workout) {
        throw APIError.NotFound("Workout not found");
      }

      await this.weekRepository.updateOne(
        { _id: weekId },
        { $pull: { workouts: { _id: workoutId } } }
      );
    } catch (error) {
      this.logger.error("Error deleting workout: ", error);

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to delete workout");
      }
    }
  }

  public async createMeal(
    weekId: Types.ObjectId,
    mealRequest: MealRequest
  ): Promise<MealResponse> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      const week = await this.weekRepository.findById(weekId);

      if (!week) {
        throw APIError.NotFound("Week not found");
      }

      const mealDocument = this.mealRepository.toDocument(mealRequest);
      const meal = await this.mealRepository.create(mealDocument, { session });

      await this.weekRepository.updateOne(
        { _id: weekId },
        { $push: { meals: meal.getId() } },
        { session }
      );

      await session.commitTransaction();

      return this.mealRepository.toResponse(meal);
    } catch (error) {
      this.logger.error("Error creating meal: ", error);

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to create meal");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  public async updateMeal(
    weekId: Types.ObjectId,
    mealId: Types.ObjectId,
    mealRequest: MealRequest
  ): Promise<void> {
    try {
      const week = await this.weekRepository.findById(weekId);

      if (!week) {
        throw APIError.NotFound("Week not found");
      }

      const meal = await this.mealRepository.findById(mealId);

      if (!meal) {
        throw APIError.NotFound("Meal not found");
      }

      const updatedMealDocument = {
        ...mealRequest,
        createdBy: new Types.ObjectId(mealRequest.createdBy),
        versionId: meal.getVersionId() + 1,
      };

      await this.mealRepository.updateOne(
        { _id: mealId },
        { $set: updatedMealDocument }
      );
    } catch (error) {
      this.logger.error("Error updating meal: ", error);

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to update meal");
      }
    }
  }

  public async deleteMeal(
    weekId: Types.ObjectId,
    mealId: Types.ObjectId
  ): Promise<void> {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const week = await this.weekRepository.findById(weekId);

      if (!week) {
        throw APIError.NotFound("Week not found");
      }

      const meal = await this.mealRepository.findById(mealId);

      if (!meal) {
        throw APIError.NotFound("Meal not found");
      }

      await this.mealRepository.findByIdAndDelete(mealId, { session });

      await this.weekRepository.updateOne(
        { _id: weekId },
        { $pull: { meals: mealId } },
        { session }
      );

      await session.commitTransaction();
    } catch (error) {
      this.logger.error("Error deleting meal: ", error);

      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to delete meal");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  public async createWorkoutLog(
    weekId: Types.ObjectId,
    workoutLogRequest: WorkoutLogRequest
  ): Promise<WorkoutLogResponse> {
    try {
      const workoutLog = this.weekRepository.toWorkoutLog(workoutLogRequest);
      const workoutId = new Types.ObjectId(workoutLogRequest.workoutId);

      const createdWorkoutLog = await this.weekRepository.createWorkoutLog(
        weekId,
        workoutId,
        workoutLog
      );

      if (!createdWorkoutLog) {
        throw APIError.InternalServerError("Failed to create workout log");
      }

      const workoutLogResponse =
        this.weekRepository.toWorkoutLogResponse(createdWorkoutLog);

      this.logger.info(
        "Workout log created successfully: ",
        workoutLogResponse
      );
      return workoutLogResponse;
    } catch (error) {
      this.logger.error("Error creating workout log: ", error);

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to create workout log");
      }
    }
  }

  public async addBlockLog(
    weekId: Types.ObjectId,
    workoutLogId: Types.ObjectId,
    blockLog: BlockLog
  ): Promise<void> {
    try {
      const week = await this.weekRepository.findById(weekId);

      if (!week) {
        throw APIError.NotFound("Week not found");
      }

      await this.weekRepository.updateOne(
        {
          _id: weekId,
          "workouts.$.workoutLogs._id": workoutLogId,
        },
        {
          $push: {
            "workouts.$.workoutLogs.$.blockLogs": blockLog,
          },
        }
      );
    } catch (error) {
      this.logger.error("Error adding block log to workout log: ", error);

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError(
          "Failed to add block log to workout log"
        );
      }
    }
  }

  public async addMealLog(mealLogRequest: MealLogRequest): Promise<void> {
    try {
      const mealLog = this.mealRepository.toMealLog(mealLogRequest);
      const mealId = new Types.ObjectId(mealLogRequest.mealId);

      await this.mealRepository.findByIdAndUpdate(
        mealId,
        {
          $push: { logs: mealLog },
        },
        { new: true }
      );
    } catch (error) {
      this.logger.error("Error adding meal log to week: ", error);

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to add meal log to week");
      }
    }
  }

  public async getWeekWorkouts(
    weekId: Types.ObjectId
  ): Promise<WorkoutResponse[]> {
    try {
      const week = await this.weekRepository.findById(weekId);

      if (!week) {
        throw APIError.NotFound("Week not found");
      }

      const workouts = week.getWorkouts();

      if (!workouts || workouts.length === 0) {
        this.logger.info("No workouts found for week: ", weekId);
        return [];
      }

      return workouts.map((workout) =>
        this.weekRepository.toWorkoutResponse(workout)
      );
    } catch (error) {
      this.logger.error("Error getting week workouts: ", error);

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to get week workouts");
      }
    }
  }

  public async getWeekMeals(weekId: Types.ObjectId): Promise<MealResponse[]> {
    try {
      const week = await this.weekRepository.findById(weekId);

      if (!week) {
        throw APIError.NotFound("Week not found");
      }

      const mealIds = week.getMeals();
      if (!mealIds || mealIds.length === 0) {
        this.logger.info("No meals found for week: ", weekId);
        return [];
      }

      const meals = await Promise.all(
        mealIds.map(async (mealId) => {
          const meal = await this.mealRepository.findById(mealId);
          return meal ? this.mealRepository.toResponse(meal) : null;
        })
      );

      // Filter out any null results (meals that might have been deleted)
      return meals.filter((meal): meal is MealResponse => meal !== null);
    } catch (error) {
      this.logger.error("Error getting week meals: ", error);

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to get week meals");
      }
    }
  }

  public async getWeek(weekId: Types.ObjectId): Promise<WeekResponse> {
    try {
      const weekResponse = await this.weekRepository.findWeek(weekId);

      if (!weekResponse) {
        throw APIError.NotFound("Week not found");
      }

      this.logger.info("Week retrieved successfully: ", weekResponse);
      return this.weekRepository.toWeekResponse(weekResponse);
    } catch (error) {
      this.logger.error("Error getting week: ", error);

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to get week");
      }
    }
  }

  public async updateWeek(
    weekId: Types.ObjectId,
    weekRequest: WeekRequest
  ): Promise<void> {
    try {
      const week = await this.weekRepository.findById(weekId);

      if (!week) {
        throw APIError.NotFound("Week not found");
      }

      await this.weekRepository.updateOne(
        { _id: weekId },
        { $set: weekRequest }
      );
    } catch (error) {
      this.logger.error("Error updating week: ", error);

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to update week");
      }
    }
  }

  public async deleteWeek(
    programId: Types.ObjectId,
    weekId: Types.ObjectId
  ): Promise<void> {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const week = await this.weekRepository.findById(weekId);

      if (!week) {
        throw APIError.NotFound("Week not found");
      }

      await this.weekRepository.findByIdAndDelete(weekId, { session });

      await this.programRepository.updateOne(
        { _id: programId },
        { $pull: { weeks: weekId } },
        { session }
      );

      // Should it also delete all meals?

      await session.commitTransaction();
    } catch (error) {
      this.logger.error("Error deleting week: ", error);
      if (session) {
        await session.abortTransaction();
      }

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to delete week");
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  public async createNote(
    weekId: Types.ObjectId,
    noteRequest: NotesRequest
  ): Promise<NotesResponse> {
    try {
      const noteDocument = this.weekRepository.toNoteDocument(noteRequest);

      const note = await this.weekRepository.createNote(noteDocument, weekId);

      if (!note) {
        throw APIError.InternalServerError("Failed to create note");
      }

      return this.weekRepository.toNotesResponse(note);
    } catch (error) {
      this.logger.error("Error creating note: ", error);

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to create note");
      }
    }
  }

  public async updateNote(
    weekId: Types.ObjectId,
    noteId: Types.ObjectId,
    noteRequest: NotesRequest
  ): Promise<void> {
    try {
      const week = await this.weekRepository.findById(weekId);

      if (!week) {
        throw APIError.NotFound("Week not found");
      }

      const note = week
        .getNotes()
        ?.find((n) => n._id?.toString() === noteId.toString());

      if (!note) {
        throw APIError.NotFound("Note not found");
      }

      const updatedNote = this.weekRepository.toNoteDocument(noteRequest);

      await this.weekRepository.updateOne(
        { _id: weekId, "notes._id": noteId },
        { $set: { notes: updatedNote } }
      );
    } catch (error) {
      this.logger.error("Error updating note: ", error);

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to update note");
      }
    }
  }

  public async deleteNote(
    weekId: Types.ObjectId,
    noteId: Types.ObjectId
  ): Promise<void> {
    try {
      const week = await this.weekRepository.findById(weekId);

      if (!week) {
        throw APIError.NotFound("Week not found");
      }

      const note = week
        .getNotes()
        ?.find((n) => n._id?.toString() === noteId.toString());

      if (!note) {
        throw APIError.NotFound("Note not found");
      }

      await this.weekRepository.updateOne(
        { _id: weekId },
        { $pull: { notes: { _id: noteId } } }
      );
    } catch (error) {
      this.logger.error("Error deleting note: ", error);

      if (error instanceof MongooseError || error instanceof MongoServerError) {
        throw DatabaseError.handleMongoDBError(error);
      } else {
        throw APIError.InternalServerError("Failed to delete note");
      }
    }
  }
}
