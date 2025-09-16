import { BaseRepository, IBaseRepository } from "../BaseRepository.js";
import Program from "../../entity/program/Program.js";
import { ProgramDocument } from "../../models/programs/programModel.js";
import { ProgramRequest, ProgramResponse } from "@seenelm/train-core";
import { Types, Model } from "mongoose";

export interface IProgramRepository
  extends IBaseRepository<Program, ProgramDocument> {
  toDocument(request: ProgramRequest): Partial<ProgramDocument>;
  toResponse(program: Program): ProgramResponse;
}

export default class ProgramRepository
  extends BaseRepository<Program, ProgramDocument>
  implements IProgramRepository
{
  private programModel: Model<ProgramDocument>;

  constructor(programModel: Model<ProgramDocument>) {
    super(programModel);
    this.programModel = programModel;
  }

  toEntity(doc: ProgramDocument): Program {
    return Program.builder()
      .setId(doc._id as Types.ObjectId)
      .setName(doc.name)
      .setTypes(doc.types)
      .setNumWeeks(doc.numWeeks)
      .setHasNutritionProgram(doc.hasNutritionProgram)
      .setPhases(doc.phases)
      .setAccessType(doc.accessType)
      .setAdmins(doc.admins)
      .setMembers(doc.members)
      .setWeeks(doc.weeks)
      .setCreatedBy(doc.createdBy)
      .setCreatedAt(doc.createdAt)
      .setUpdatedAt(doc.updatedAt)
      .build();
  }

  toDocument(request: ProgramRequest): Partial<ProgramDocument> {
    return {
      name: request.name,
      types: request.types,
      numWeeks: request.numWeeks,
      hasNutritionProgram: request.hasNutritionProgram,
      phases: request.phases,
      accessType: request.accessType,
      createdBy: new Types.ObjectId(request.createdBy),
      admins: request.admins.map((id) => new Types.ObjectId(id)),
      members: request.members?.map((id) => new Types.ObjectId(id)) || [],
      weeks: [], // Will be populated after week documents are created
    };
  }

  toResponse(program: Program): ProgramResponse {
    return {
      id: program.getId().toString(),
      name: program.getName(),
      types: program.getTypes(),
      numWeeks: program.getNumWeeks(),
      hasNutritionProgram: program.getHasNutritionProgram(),
      phases: program.getPhases(),
      accessType: program.getAccessType(),
      admins: program.getAdmins().map((id) => id.toString()),
      members: program.getMembers()?.map((id) => id.toString()) || [],
      weeks: program.getWeeks()?.map((id) => id.toString()) || [],
      createdBy: program.getCreatedBy().toString(),
    };
  }
}
