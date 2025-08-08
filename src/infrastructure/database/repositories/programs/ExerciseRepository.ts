import { BaseRepository, IBaseRepository } from "../BaseRepository.js";
import Exercise from "../../entity/program/Exercise.js";
import { ExerciseDocument } from "../../models/programs/exerciseModel.js";
import { ExerciseModel } from "../../models/programs/exerciseModel.js";
import { ExerciseRequest, ExerciseResponse } from "@seenelm/train-core";
import { Types } from "mongoose";

export interface IExerciseRepository
  extends IBaseRepository<Exercise, ExerciseDocument> {}

export default class ExerciseRepository
  extends BaseRepository<Exercise, ExerciseDocument>
  implements IExerciseRepository
{
  constructor() {
    super(ExerciseModel);
  }

  toEntity(doc: ExerciseDocument): Exercise {
    return Exercise.builder()
      .setId(doc._id as Types.ObjectId)
      .setName(doc.name ?? "")
      .setGroup(doc.group ?? "")
      .setImagePath(doc.imagePath ?? "")
      .setWeight(doc.weight ?? "")
      .setTargetSets(doc.targetSets ?? 0)
      .setTargetReps(doc.targetReps ?? 0)
      .setNotes(doc.notes ?? "")
      .setCompleted(doc.completed ?? false)
      .setCreatedBy(doc.createdBy)
      .setSets(doc.sets)
      .build();
  }

  toDocument(request: ExerciseRequest): Partial<ExerciseDocument> {
    return {
      name: request.name,
      group: request.group,
      imagePath: request.imagePath,
      weight: request.weight,
      targetSets: request.targetSets,
      targetReps: request.targetReps,
      notes: request.notes,
      completed: request.completed,
      createdBy: new Types.ObjectId(request.createdBy),
      sets: request.sets.map((setId) => new Types.ObjectId(setId)),
    };
  }

  toResponse(exercise: Exercise): ExerciseResponse {
    return {
      id: exercise.getId().toString(),
      name: exercise.getName(),
      group: exercise.getGroup(),
      imagePath: exercise.getImagePath(),
      weight: exercise.getWeight(),
      targetSets: exercise.getTargetSets(),
      targetReps: exercise.getTargetReps(),
      notes: exercise.getNotes(),
      completed: exercise.isCompleted(),
      createdBy: exercise.getCreatedBy().toString(),
      sets: exercise.getSets().map((setId) => setId.toString()),
    };
  }
}
