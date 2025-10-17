import { BaseRepository, IBaseRepository } from "../BaseRepository.js";
import { MealDocument, MealLog } from "../../models/programs/mealModel.js";
import { MealRequest, MealResponse, MealLogRequest } from "@seenelm/train-core";
import { Types, Model } from "mongoose";
import { Logger } from "../../../../common/logger.js";
import Meal from "../../entity/program/Meal.js";

export interface IMealRepository extends IBaseRepository<Meal, MealDocument> {
  toResponse(meal: Meal): MealResponse;
  toDocument(mealRequest: MealRequest): Partial<MealDocument>;
  toMealLog(mealLogRequest: MealLogRequest): MealLog;
}

export default class MealRepository
  extends BaseRepository<Meal, MealDocument>
  implements IMealRepository
{
  private mealModel: Model<MealDocument>;
  private logger: Logger;

  constructor(mealModel: Model<MealDocument>) {
    super(mealModel);
    this.mealModel = mealModel;
    this.logger = Logger.getInstance();
  }

  toEntity(doc: MealDocument): Meal {
    return Meal.builder()
      .setId(doc._id as Types.ObjectId)
      .setVersionId(doc.versionId)
      .setCreatedBy(doc.createdBy)
      .setMealName(doc.mealName)
      .setMacros(doc.macros)
      .setIngredients(doc.ingredients)
      .setInstructions(doc.instructions)
      .setLogs(doc.logs)
      .setStartDate(doc.startDate)
      .setEndDate(doc.endDate)
      .setCreatedAt(doc.createdAt as Date)
      .setUpdatedAt(doc.updatedAt as Date)
      .build();
  }

  toDocument(mealRequest: MealRequest): Partial<MealDocument> {
    return {
      ...mealRequest,
      createdBy: new Types.ObjectId(mealRequest.createdBy),
    };
  }

  toMealLog(mealLogRequest: MealLogRequest): MealLog {
    return {
      ...mealLogRequest,
      userId: new Types.ObjectId(mealLogRequest.userId),
      mealId: new Types.ObjectId(mealLogRequest.mealId),
      mealSnapshot: {
        ...mealLogRequest.mealSnapshot,
        createdBy: new Types.ObjectId(mealLogRequest.mealSnapshot.createdBy),
      },
    };
  }

  toResponse(meal: Meal): MealResponse {
    return {
      id: meal.getId().toString(),
      versionId: meal.getVersionId(),
      createdBy: meal.getCreatedBy().toString(),
      mealName: meal.getMealName(),
      macros: meal.getMacros(),
      ingredients: meal.getIngredients(),
      instructions: meal.getInstructions(),
      startDate: meal.getStartDate(),
      endDate: meal.getEndDate(),
    };
  }
}
