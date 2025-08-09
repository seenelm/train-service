import { BaseRepository, IBaseRepository } from "../BaseRepository.js";
import Set from "../../entity/program/Set.js";
import { SetModel, SetDocument } from "../../models/programs/setModel.js";
import { SetRequest, SetResponse } from "@seenelm/train-core";
import { Types } from "mongoose";

export interface ISetRepository extends IBaseRepository<Set, SetDocument> {}

export default class SetRepository
  extends BaseRepository<Set, SetDocument>
  implements ISetRepository
{
  constructor() {
    super(SetModel);
  }

  toEntity(doc: SetDocument): Set {
    return Set.builder()
      .setId(doc._id as Types.ObjectId)
      .setWeight(doc.weight ?? 0)
      .setReps(doc.reps ?? 0)
      .setCompleted(doc.completed ?? false)
      .setImagePath(doc.imagePath ?? "")
      .setLink(doc.link ?? "")
      .setCreatedBy(doc.createdBy as Types.ObjectId)
      .setCreatedAt(doc.createdAt ?? new Date())
      .setUpdatedAt(doc.updatedAt ?? new Date())
      .build();
  }

  toDocument(request: SetRequest): Partial<SetDocument> {
    return {
      weight: request.weight,
      reps: request.reps,
      completed: request.completed,
      imagePath: request.imagePath,
      link: request.link,
      createdBy: new Types.ObjectId(request.createdBy),
    };
  }

  toResponse(set: Set): SetResponse {
    return {
      id: set.getId().toString(),
      weight: set.getWeight(),
      reps: set.getReps(),
      completed: set.getCompleted(),
      imagePath: set.getImagePath(),
      link: set.getLink(),
      createdBy: set.getCreatedBy().toString(),
    };
  }
}
