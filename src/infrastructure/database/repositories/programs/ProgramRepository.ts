import { BaseRepository, IBaseRepository } from "../BaseRepository.js";
import Program from "../../entity/program/Program.js";
import {
  ProgramModel,
  ProgramDocument,
} from "../../models/programs/programModel.js";
import { ProgramRequest } from "@seenelm/train-core";
import { Types } from "mongoose";

export interface IProgramRepository
  extends IBaseRepository<Program, ProgramDocument> {}

export default class ProgramRepository
  extends BaseRepository<Program, ProgramDocument>
  implements IProgramRepository
{
  constructor() {
    super(ProgramModel);
  }

  toEntity(doc: ProgramDocument): Program {
    return Program.builder()
      .setId(doc._id as Types.ObjectId)
      .setName(doc.name)
      .setDescription(doc.description)
      .setCategory(doc.category)
      .setImagePath(doc.imagePath)
      .setCreatedBy(doc.createdBy)
      .setWeeks(doc.weeks)
      .setDifficulty(doc.difficulty)
      .setNumWeeks(doc.numWeeks)
      .build();
  }

  toDocument(request: ProgramRequest): Partial<ProgramDocument> {
    return {
      name: request.name,
      description: request.description,
      category: request.category,
      imagePath: request.imagePath,
      createdBy: new Types.ObjectId(request.createdBy),
      numWeeks: request.numWeeks,
      weeks: request.weeks.map((weekId) => new Types.ObjectId(weekId)),
      difficulty: request.difficulty,
    };
  }
}
