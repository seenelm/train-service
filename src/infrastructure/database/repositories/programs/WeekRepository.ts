import { BaseRepository, IBaseRepository } from "../BaseRepository.js";
import Week from "../../entity/program/Week.js";
import { WeekDocument, WorkoutLog } from "../../models/programs/weekModel.js";
import {
  WeekResponse,
  WorkoutResponse,
  NotesResponse,
  WorkoutRequest,
  MealResponse,
  Macros,
  Ingredient,
  WorkoutLogRequest,
  WorkoutLogResponse,
  NotesRequest,
} from "@seenelm/train-core";
import { Types, Model } from "mongoose";
import { Workout, Notes } from "../../models/programs/weekModel.js";
import { Logger } from "../../../../common/logger.js";

export interface AggregatedMeal {
  _id: Types.ObjectId;
  versionId: number;
  createdBy: Types.ObjectId;
  mealName: string;
  macros?: Macros;
  ingredients?: Ingredient[];
  instructions?: string;
  startDate: Date;
  endDate: Date;
}

export interface AggregatedWeek {
  _id: Types.ObjectId;
  name?: string;
  description?: string;
  weekNumber: number;
  workouts: Types.ObjectId[];
  meals?: Types.ObjectId[];
  notes?: Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWeekRepository extends IBaseRepository<Week, WeekDocument> {
  toWorkoutResponse(workout: Workout): WorkoutResponse;
  toNotesResponse(notes: Notes): NotesResponse;
  toWeekResponse(week: AggregatedWeek): WeekResponse;
  toWorkoutLog(workoutLogRequest: WorkoutLogRequest): WorkoutLog;
  toWorkoutLogResponse(workoutLog: WorkoutLog): WorkoutLogResponse;
  toNoteDocument(noteRequest: NotesRequest): Notes;
  createWorkout(
    weekId: Types.ObjectId,
    workout: WorkoutRequest
  ): Promise<Workout | null>;
  createWorkoutLog(
    weekId: Types.ObjectId,
    workoutId: Types.ObjectId,
    workoutLog: WorkoutLog,
    workoutIndex: number
  ): Promise<WorkoutLog | null>;
  findWeek(weekId: Types.ObjectId): Promise<AggregatedWeek | null>;
  createNote(note: Notes, weekId: Types.ObjectId): Promise<Notes | null>;
}

export default class WeekRepository
  extends BaseRepository<Week, WeekDocument>
  implements IWeekRepository
{
  private weekModel: Model<WeekDocument>;
  private logger: Logger;

  constructor(weekModel: Model<WeekDocument>) {
    super(weekModel);
    this.weekModel = weekModel;
    this.logger = Logger.getInstance();
  }

  toEntity(doc: WeekDocument): Week {
    const builder = Week.builder()
      .setId(doc._id as Types.ObjectId)
      .setWeekNumber(doc.weekNumber)
      .setStartDate(doc.startDate)
      .setEndDate(doc.endDate);

    if (doc.workouts) {
      builder.setWorkouts(doc.workouts);
    }

    if (doc.meals) {
      builder.setMeals(doc.meals);
    }

    if (doc.notes) {
      builder.setNotes(doc.notes);
    }

    if (doc.createdAt) {
      builder.setCreatedAt(doc.createdAt);
    }

    if (doc.updatedAt) {
      builder.setUpdatedAt(doc.updatedAt);
    }

    return builder.build();
  }

  toNoteDocument(noteRequest: NotesRequest): Notes {
    return {
      ...noteRequest,
      createdBy: new Types.ObjectId(noteRequest.createdBy),
    };
  }

  toWorkoutLog(workoutLogRequest: WorkoutLogRequest): WorkoutLog {
    return {
      ...workoutLogRequest,
      userId: new Types.ObjectId(workoutLogRequest.userId),
      workoutId: new Types.ObjectId(workoutLogRequest.workoutId),
      blockLogs: workoutLogRequest.blockLogs || [],
      workoutSnapshot: {
        ...workoutLogRequest.workoutSnapshot,
        createdBy: new Types.ObjectId(
          workoutLogRequest.workoutSnapshot.createdBy
        ),
      },
    };
  }

  toWorkoutLogResponse(workoutLog: WorkoutLog): WorkoutLogResponse {
    return {
      id: workoutLog._id?.toString() || "",
      userId: workoutLog.userId.toString(),
      workoutId: workoutLog.workoutId.toString(),
      versionId: workoutLog.versionId,
      workoutSnapshot: {
        name: workoutLog.workoutSnapshot.name,
        description: workoutLog.workoutSnapshot.description,
        category: workoutLog.workoutSnapshot.category,
        difficulty: workoutLog.workoutSnapshot.difficulty,
        duration: workoutLog.workoutSnapshot.duration,
        accessType: workoutLog.workoutSnapshot.accessType,
        createdBy: workoutLog.workoutSnapshot.createdBy.toString(),
        startDate: workoutLog.workoutSnapshot.startDate,
        endDate: workoutLog.workoutSnapshot.endDate,
        blockSnapshot: workoutLog.workoutSnapshot.blockSnapshot,
      },
      blockLogs:
        workoutLog.blockLogs?.map((blockLog) => ({
          actualRest: blockLog.actualRest,
          actualSets: blockLog.actualSets,
          exerciseLogs: blockLog.exerciseLogs.map((exerciseLog) => ({
            name: exerciseLog.name,
            actualRest: exerciseLog.actualRest,
            actualReps: exerciseLog.actualReps,
            actualDurationSec: exerciseLog.actualDurationSec,
            actualDistance: exerciseLog.actualDistance,
            actualWeight: exerciseLog.actualWeight,
            isCompleted: exerciseLog.isCompleted,
            order: exerciseLog.order,
          })),
          order: blockLog.order,
          isCompleted: blockLog.isCompleted,
        })) || [],
      actualDuration: workoutLog.actualDuration,
      actualStartDate: workoutLog.actualStartDate,
      actualEndDate: workoutLog.actualEndDate,
      isCompleted: workoutLog.isCompleted,
    };
  }

  toWeekResponse(week: AggregatedWeek): WeekResponse {
    return {
      id: week._id.toString(),
      name: week.name,
      description: week.description,
      weekNumber: week.weekNumber,
      workouts: week.workouts.map((workout) => workout.toString()),
      meals: week.meals?.map((meal) => meal.toString()) || [],
      notes: week.notes?.map((notes) => notes.toString()) || [],
      startDate: week.startDate,
      endDate: week.endDate,
    };
  }

  private toMealResponse(meal: AggregatedMeal): MealResponse {
    return {
      id: meal._id.toString(),
      versionId: meal.versionId,
      createdBy: meal.createdBy.toString(),
      mealName: meal.mealName,
      macros: meal.macros,
      ingredients: meal.ingredients,
      instructions: meal.instructions,
      startDate: meal.startDate,
      endDate: meal.endDate,
    };
  }

  toWorkoutResponse(workout: Workout): WorkoutResponse {
    return {
      id: workout._id?.toString() || "",
      versionId: workout.versionId,
      name: workout.name,
      description: workout.description,
      category: workout.category,
      difficulty: workout.difficulty,
      duration: workout.duration,
      blocks: workout.blocks || [],
      accessType: workout.accessType,
      createdBy: workout.createdBy.toString(),
      startDate: workout.startDate,
      endDate: workout.endDate,
    };
  }

  toNotesResponse(notes: Notes): NotesResponse {
    return {
      id: notes._id?.toString() || "",
      createdBy: notes.createdBy.toString(),
      title: notes.title,
      content: notes.content,
      startDate: notes.startDate,
      endDate: notes.endDate,
    };
  }

  async createWorkout(
    weekId: Types.ObjectId,
    workout: WorkoutRequest
  ): Promise<Workout | null> {
    try {
      const workoutDocument = {
        ...workout,
        createdBy: new Types.ObjectId(workout.createdBy),
        versionId: 1,
        blocks: workout.blocks || [],
      };

      const updatedWeek = await this.weekModel.findByIdAndUpdate(
        weekId,
        { $push: { workouts: workoutDocument } },
        { new: true }
      );

      if (!updatedWeek) {
        return null;
      }

      return updatedWeek.workouts[updatedWeek.workouts.length - 1] as Workout;
    } catch (error) {
      this.logger.error("Error creating workout: ", error);
      throw error;
    }
  }

  async createNote(note: Notes, weekId: Types.ObjectId): Promise<Notes | null> {
    try {
      const updatedWeek = await this.weekModel.findByIdAndUpdate(
        weekId,
        { $push: { notes: note } },
        { new: true }
      );

      if (!updatedWeek) {
        return null;
      }

      return updatedWeek.notes?.[updatedWeek.notes.length - 1] as Notes;
    } catch (error) {
      this.logger.error("Error creating note: ", error);
      throw error;
    }
  }

  async createWorkoutLog(
    weekId: Types.ObjectId,
    workoutId: Types.ObjectId,
    workoutLog: WorkoutLog,
    workoutIndex: number
  ): Promise<WorkoutLog | null> {
    try {
      const updatedWeek = await this.weekModel.findOneAndUpdate(
        { _id: weekId },
        {
          $push: {
            [`workouts.${workoutIndex}.workoutLogs`]: workoutLog,
          },
        },
        { new: true }
      );

      if (!updatedWeek) {
        this.logger.error("Failed to update week with workout log", {
          weekId: weekId.toString(),
          workoutId: workoutId.toString(),
          workoutIndex,
        });
        return null;
      }

      const updatedWorkout = (updatedWeek as WeekDocument).workouts[
        workoutIndex
      ];
      if (!updatedWorkout || !updatedWorkout.workoutLogs) {
        this.logger.error("Workout or workoutLogs not found after update", {
          weekId: weekId.toString(),
          workoutId: workoutId.toString(),
          workoutIndex,
        });
        return null;
      }

      const lastWorkoutLog =
        updatedWorkout.workoutLogs[updatedWorkout.workoutLogs.length - 1];

      return lastWorkoutLog;
    } catch (error) {
      this.logger.error("Error creating workout log: ", error);
      throw error;
    }
  }

  async findWeek(weekId: Types.ObjectId): Promise<AggregatedWeek | null> {
    try {
      const result = await this.weekModel.aggregate<AggregatedWeek>([
        { $match: { _id: weekId, isActive: true } },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            weekNumber: 1,
            workouts: {
              $map: { input: "$workouts", as: "workout", in: "$$workout._id" },
            },
            meals: 1,
            notes: { $map: { input: "$notes", as: "note", in: "$$note._id" } },
            startDate: 1,
            endDate: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $limit: 1 },
      ]);

      if (result.length === 0) {
        return null;
      }

      return result[0];
    } catch (error) {
      this.logger.error("Error finding week: ", error);
      throw error;
    }
  }
}
