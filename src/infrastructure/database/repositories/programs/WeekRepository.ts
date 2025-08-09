import { BaseRepository, IBaseRepository } from "../BaseRepository.js";
import Week from "../../entity/program/Week.js";
import { WeekDocument, WeekModel } from "../../models/programs/weekModel.js";
import { WeekRequest, WeekResponse } from "@seenelm/train-core";
import { Types } from "mongoose";

export interface IWeekRepository extends IBaseRepository<Week, WeekDocument> {}

export default class WeekRepository
  extends BaseRepository<Week, WeekDocument>
  implements IWeekRepository
{
  constructor() {
    super(WeekModel);
  }

  toEntity(doc: WeekDocument): Week {
    return Week.builder()
      .setId(doc._id as Types.ObjectId)
      .setProgramId(doc.programId as Types.ObjectId)
      .setName(doc.name ?? "")
      .setDescription(doc.description ?? "")
      .setImagePath(doc.imagePath ?? "")
      .setWeekNumber(doc.weekNumber ?? 0)
      .setWorkouts(doc.workouts ?? [])
      .setCreatedAt(doc.createdAt ?? new Date())
      .setUpdatedAt(doc.updatedAt ?? new Date())
      .build();
  }

  toDocument(request: WeekRequest): Partial<WeekDocument> {
    return {
      programId: new Types.ObjectId(request.programId),
      name: request.name,
      description: request.description,
      imagePath: request.imagePath,
      weekNumber: request.weekNumber,
      workouts: request.workouts.map(
        (workoutId) => new Types.ObjectId(workoutId)
      ),
    };
  }

  toResponse(week: Week): WeekResponse {
    return {
      id: week.getId().toString(),
      programId: week.getProgramId().toString(),
      name: week.getName(),
      description: week.getDescription(),
      imagePath: week.getImagePath(),
      weekNumber: week.getWeekNumber(),
      workouts: week.getWorkouts().map((workoutId) => workoutId.toString()),
    };
  }
}
