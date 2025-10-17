import { BaseRepository, IBaseRepository } from "../BaseRepository.js";
import Program from "../../entity/program/Program.js";
import { ProgramDocument } from "../../models/programs/programModel.js";
import {
  ProgramRequest,
  ProgramResponse,
  WeekDetail,
  Phase,
  ProfileAccess,
} from "@seenelm/train-core";
import { Types, Model } from "mongoose";
import { Logger } from "../../../../common/logger.js";

export interface ProgramWithWeeks {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  types?: string[];
  numWeeks: number;
  hasNutritionProgram?: boolean;
  phases?: Phase[];
  accessType: ProfileAccess;
  admins: Types.ObjectId[];
  createdBy: Types.ObjectId;
  members?: Types.ObjectId[];
  weeks?: WeekDetail[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProgramRepository
  extends IBaseRepository<Program, ProgramDocument> {
  toDocument(request: ProgramRequest): Partial<ProgramDocument>;
  toResponse(program: Program): ProgramResponse;
  getUserProgramsWithWeeks(userId: Types.ObjectId): Promise<ProgramWithWeeks[]>;
  toResponseWithWeeks(program: ProgramWithWeeks): ProgramResponse;
  getProgramById(programId: Types.ObjectId): Promise<ProgramWithWeeks | null>;
}

export default class ProgramRepository
  extends BaseRepository<Program, ProgramDocument>
  implements IProgramRepository
{
  private programModel: Model<ProgramDocument>;
  private logger: Logger;

  constructor(programModel: Model<ProgramDocument>) {
    super(programModel);
    this.programModel = programModel;
    this.logger = Logger.getInstance();
  }

  toEntity(doc: ProgramDocument): Program {
    return Program.builder()
      .setId(doc._id as Types.ObjectId)
      .setName(doc.name)
      .setDescription(doc.description)
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
      description: request.description,
      types: request.types,
      numWeeks: request.numWeeks,
      hasNutritionProgram: request.hasNutritionProgram,
      phases: request.phases,
      accessType: request.accessType,
      createdBy: new Types.ObjectId(request.createdBy),
      admins: request.admins?.map((id) => new Types.ObjectId(id)) || [
        new Types.ObjectId(request.createdBy),
      ],
      members: request.members?.map((id) => new Types.ObjectId(id)) || [],
      weeks: [],
      isActive: true,
    };
  }

  toResponse(program: Program): ProgramResponse {
    return {
      id: program.getId().toString(),
      name: program.getName(),
      description: program.getDescription(),
      types: program.getTypes(),
      numWeeks: program.getNumWeeks(),
      hasNutritionProgram: program.getHasNutritionProgram(),
      phases: program.getPhases(),
      accessType: program.getAccessType(),
      admins: program.getAdmins().map((id) => id.toString()),
      members: program.getMembers()?.map((id) => id.toString()) || [],
      weeks: [],
      createdBy: program.getCreatedBy().toString(),
    };
  }

  toResponseWithWeeks(program: ProgramWithWeeks): ProgramResponse {
    return {
      id: program._id.toString(),
      name: program.name,
      description: program.description,
      types: program.types,
      numWeeks: program.numWeeks,
      hasNutritionProgram: program.hasNutritionProgram,
      phases: program.phases,
      accessType: program.accessType,
      admins: program.admins?.map((id) => id.toString()) || [],
      members: program.members?.map((id) => id.toString()) || [],
      createdBy: program.createdBy.toString(),
      weeks: program.weeks || [],
    };
  }

  public async getProgramById(
    programId: Types.ObjectId
  ): Promise<ProgramWithWeeks | null> {
    try {
      const result = await this.programModel.aggregate<ProgramWithWeeks>([
        {
          $match: {
            _id: programId,
            isActive: true,
          },
        },
        {
          $lookup: {
            from: "weeks",
            localField: "weeks",
            foreignField: "_id",
            as: "weekDetails",
            pipeline: [
              {
                $match: {
                  isActive: true,
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            types: 1,
            numWeeks: 1,
            hasNutritionProgram: 1,
            phases: 1,
            accessType: 1,
            admins: 1,
            members: 1,
            createdBy: 1,
            createdAt: 1,
            updatedAt: 1,
            weeks: {
              $map: {
                input: "$weekDetails",
                as: "week",
                in: {
                  id: { $toString: "$$week._id" },
                  name: "$$week.name",
                  description: "$$week.description",
                  weekNumber: "$$week.weekNumber",
                },
              },
            },
          },
        },
        { $limit: 1 },
      ]);

      if (result.length === 0) {
        return null;
      }

      return result[0];
    } catch (error) {
      this.logger.error("Error finding program by id: ", error);
      throw error;
    }
  }

  async getUserProgramsWithWeeks(
    userId: Types.ObjectId
  ): Promise<ProgramWithWeeks[]> {
    try {
      const result = await this.programModel.aggregate<ProgramWithWeeks>([
        {
          $match: {
            $or: [
              { createdBy: userId },
              { admins: userId },
              { members: userId },
            ],
            // Only return active programs
            isActive: true,
          },
        },
        {
          $lookup: {
            from: "weeks",
            localField: "weeks",
            foreignField: "_id",
            as: "weekDetails",
            // Add pipeline to filter only active weeks
            pipeline: [
              {
                $match: {
                  isActive: true,
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            types: 1,
            numWeeks: 1,
            hasNutritionProgram: 1,
            phases: 1,
            accessType: 1,
            admins: 1,
            members: 1,
            createdBy: 1,
            createdAt: 1,
            updatedAt: 1,
            weeks: {
              $map: {
                input: "$weekDetails",
                as: "week",
                in: {
                  id: { $toString: "$$week._id" },
                  name: "$$week.name",
                  description: "$$week.description",
                  weekNumber: "$$week.weekNumber",
                },
              },
            },
          },
        },
      ]);

      return result;
    } catch (error) {
      throw error;
    }
  }
}
