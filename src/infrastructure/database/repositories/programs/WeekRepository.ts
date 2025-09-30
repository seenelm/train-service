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
  workouts: Workout[];
  meals?: AggregatedMeal[];
  notes?: Notes[];
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWeekRepository extends IBaseRepository<Week, WeekDocument> {
  toResponse(week: Week): WeekResponse;
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
    workoutLog: WorkoutLog
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
    };
  }

  toResponse(week: Week): WeekResponse {
    return {
      id: week.getId().toString(),
      weekNumber: week.getWeekNumber(),
      workouts:
        week.getWorkouts()?.map((workout) => this.toWorkoutResponse(workout)) ||
        [],
      meals: [],
      notes: week.getNotes()?.map((notes) => this.toNotesResponse(notes)) || [],
      startDate: week.getStartDate(),
      endDate: week.getEndDate(),
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
      ...workoutLog,
      id: workoutLog._id?.toString() || "",
      userId: workoutLog.userId.toString(),
      workoutId: workoutLog.workoutId.toString(),
      workoutSnapshot: {
        ...workoutLog.workoutSnapshot,
        createdBy: workoutLog.workoutSnapshot.createdBy.toString(),
      },
    };
  }

  toWeekResponse(week: AggregatedWeek): WeekResponse {
    return {
      id: week._id.toString(),
      name: week.name,
      description: week.description,
      weekNumber: week.weekNumber,
      workouts: week.workouts.map((workout) => this.toWorkoutResponse(workout)),
      meals: week.meals?.map((meal) => this.toMealResponse(meal)) || [],
      notes: week.notes?.map((notes) => this.toNotesResponse(notes)) || [],
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
        versionId: 1, // Default version for new workouts
        blocks: workout.blocks || [], // Ensure blocks is always an array even if not provided
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
    workoutLog: WorkoutLog
  ): Promise<WorkoutLog | null> {
    try {
      const updatedWeek = await this.weekModel.findByIdAndUpdate(
        {
          _id: weekId,
          "workouts._id": workoutId,
        },
        {
          $push: { "workouts.$.workoutLogs": workoutLog },
        },
        { new: true }
      );

      if (!updatedWeek) {
        return null;
      }

      const workout = (updatedWeek as WeekDocument).workouts.find(
        (w: Workout) => w._id?.toString() === workoutId.toString()
      );
      if (!workout || !workout.workoutLogs) {
        return null;
      }

      const lastWorkoutLog =
        workout.workoutLogs[workout.workoutLogs.length - 1];
      return lastWorkoutLog as WorkoutLog;
    } catch (error) {
      this.logger.error("Error creating workout log: ", error);
      throw error;
    }
  }

  async findWeek(weekId: Types.ObjectId): Promise<AggregatedWeek | null> {
    try {
      const result = await this.weekModel.aggregate<AggregatedWeek>([
        { $match: { _id: weekId } },
        {
          $lookup: {
            from: "meals",
            localField: "meals",
            foreignField: "_id",
            as: "meals",
          },
        },
        { $limit: 1 },
      ]);

      if (result.length === 0) {
        return null;
      }

      return result[0];
    } catch (error) {
      this.logger.error(
        "Error finding week with meals using aggregate: ",
        error
      );
      throw error;
    }
  }
}
