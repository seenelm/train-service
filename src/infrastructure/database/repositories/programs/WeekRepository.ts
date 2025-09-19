import { BaseRepository, IBaseRepository } from "../BaseRepository.js";
import Week from "../../entity/program/Week.js";
import { WeekDocument } from "../../models/programs/weekModel.js";
import {
  WeekResponse,
  WorkoutResponse,
  NotesResponse,
  WorkoutRequest,
} from "@seenelm/train-core";
import { Types, Model } from "mongoose";
import { Workout, Notes } from "../../models/programs/weekModel.js";
import { Logger } from "../../../../common/logger.js";

export interface IWeekRepository extends IBaseRepository<Week, WeekDocument> {
  toResponse(week: Week): WeekResponse;
  toWorkoutResponse(workout: Workout): WorkoutResponse;
  toNotesResponse(notes: Notes): NotesResponse;
  createWorkout(
    weekId: Types.ObjectId,
    workout: WorkoutRequest
  ): Promise<Workout | null>;
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

  toResponse(week: Week): WeekResponse {
    return {
      id: week.getId().toString(),
      weekNumber: week.getWeekNumber(),
      workouts:
        week.getWorkouts()?.map((workout) => this.toWorkoutResponse(workout)) ||
        [],
      meals: undefined, // TODO: Convert ObjectId[] to MealResponse[] when needed
      notes: week.getNotes()?.map((notes) => this.toNotesResponse(notes)) || [],
      startDate: week.getStartDate(),
      endDate: week.getEndDate(),
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
      blocks: workout.blocks,
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
      const updatedWeek = await this.weekModel.findByIdAndUpdate(
        weekId,
        { $push: { workouts: workout } },
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
}
