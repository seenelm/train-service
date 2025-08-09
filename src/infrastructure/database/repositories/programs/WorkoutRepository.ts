import { BaseRepository, IBaseRepository } from "../BaseRepository.js";
import Workout from "../../entity/program/Workout.js";
import {
  WorkoutDocument,
  WorkoutModel,
} from "../../models/programs/workoutModel.js";
import { WorkoutRequest, WorkoutResponse } from "@seenelm/train-core";
import { Types } from "mongoose";

export interface IWorkoutRepository
  extends IBaseRepository<Workout, WorkoutDocument> {}

export default class WorkoutRepository
  extends BaseRepository<Workout, WorkoutDocument>
  implements IWorkoutRepository
{
  constructor() {
    super(WorkoutModel);
  }

  toEntity(doc: WorkoutDocument): Workout {
    return Workout.builder()
      .setId(doc._id as Types.ObjectId)
      .setTitle(doc.title ?? "")
      .setDescription(doc.description ?? "")
      .setImagePath(doc.imagePath ?? "")
      .setCompleted(doc.completed ?? false)
      .setCreatedBy(doc.createdBy as Types.ObjectId)
      .setExercises(doc.exercises ?? [])
      .setCreatedAt(doc.createdAt ?? new Date())
      .setUpdatedAt(doc.updatedAt ?? new Date())
      .build();
  }

  toDocument(request: WorkoutRequest): Partial<WorkoutDocument> {
    return {
      title: request.title,
      description: request.description,
      imagePath: request.imagePath,
      completed: request.completed,
      createdBy: new Types.ObjectId(request.createdBy),
      exercises: request.exercises.map(
        (exerciseId) => new Types.ObjectId(exerciseId)
      ),
    };
  }

  toResponse(workout: Workout): WorkoutResponse {
    return {
      id: workout.getId().toString(),
      title: workout.getTitle(),
      description: workout.getDescription(),
      imagePath: workout.getImagePath(),
      completed: workout.isCompleted(),
      createdBy: workout.getCreatedBy().toString(),
      exercises: workout
        .getExercises()
        .map((exerciseId) => exerciseId.toString()),
    };
  }
}
