import { IBaseRepository } from "../BaseRepository.js";
import UserProgram from "../../entity/program/UserProgram.js";
import { UserProgramDocument } from "../../models/programs/userProgramModel.js";
import { BaseRepository } from "../BaseRepository.js";
import { Model, Types } from "mongoose";
import { ProgramResponse } from "@seenelm/train-core";
import { ProgramWithWeeks } from "./ProgramRepository.js";
import { Logger } from "../../../../common/logger.js";

export interface IUserProgramRepository
  extends IBaseRepository<UserProgram, UserProgramDocument> {
  getUserProgramsWithWeeks(userId: Types.ObjectId): Promise<ProgramWithWeeks[]>;
}

export default class UserProgramRepository
  extends BaseRepository<UserProgram, UserProgramDocument>
  implements IUserProgramRepository
{
  private userProgramModel: Model<UserProgramDocument>;
  private logger: Logger;

  constructor(userProgramModel: Model<UserProgramDocument>) {
    super(userProgramModel);
    this.userProgramModel = userProgramModel;
    this.logger = Logger.getInstance();
  }

  toEntity(doc: UserProgramDocument): UserProgram {
    return UserProgram.builder()
      .setId(doc._id as Types.ObjectId)
      .setUserId(doc.userId as Types.ObjectId)
      .setPrograms(doc.programs as Types.ObjectId[])
      .setCreatedAt(doc.createdAt)
      .setUpdatedAt(doc.updatedAt)
      .build();
  }

  async getUserProgramsWithWeeks(
    userId: Types.ObjectId
  ): Promise<ProgramWithWeeks[]> {
    try {
      const result = await this.userProgramModel.aggregate<ProgramWithWeeks>([
        { $match: { userId: userId } },
        {
          $lookup: {
            from: "programs",
            localField: "programs",
            foreignField: "_id",
            as: "programDetails",
            pipeline: [
              {
                $match: {
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
            ],
          },
        },
      ]);

      return result;
    } catch (error) {
      this.logger.error("Error getting user programs with weeks: ", error);
      throw error;
    }
  }
}
