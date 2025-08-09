import { BaseRepository, IBaseRepository } from "../BaseRepository.js";
import { GroupProgramsDocument } from "../../models/programs/groupProgramModel.js";
import GroupProgram from "../../entity/program/GroupProgram.js";
import { Types, Model } from "mongoose";
import { GroupProgramsResponse } from "@seenelm/train-core";

export interface IGroupProgramRepository
  extends IBaseRepository<GroupProgram, GroupProgramsDocument> {
  findGroupPrograms(groupId: Types.ObjectId): Promise<GroupProgramsResponse[]>;
}

export default class GroupProgramRepository
  extends BaseRepository<GroupProgram, GroupProgramsDocument>
  implements IGroupProgramRepository
{
  private groupPrograms: Model<GroupProgramsDocument>;
  constructor(groupPrograms: Model<GroupProgramsDocument>) {
    super(groupPrograms);
    this.groupPrograms = groupPrograms;
  }

  toEntity(doc: GroupProgramsDocument): GroupProgram {
    return GroupProgram.builder()
      .setId(doc._id as Types.ObjectId)
      .setGroupId(doc.groupId)
      .setPrograms(doc.programs)
      .build();
  }

  public async findGroupPrograms(
    groupId: Types.ObjectId
  ): Promise<GroupProgramsResponse[]> {
    const groupPrograms = await this.groupPrograms
      .aggregate([
        {
          $match: {
            groupId,
          },
        },
        {
          $lookup: {
            from: "programs",
            localField: "programs",
            foreignField: "_id",
            as: "programs",
          },
        },
        {
          $unwind: "$programs",
        },
        {
          $replaceRoot: { newRoot: "$programs" },
        },
        {
          $lookup: {
            from: "weeks",
            localField: "weeks",
            foreignField: "_id",
            as: "weeks",
          },
        },
        {
          $unwind: {
            path: "$weeks",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "workouts",
            localField: "weeks.workouts",
            foreignField: "_id",
            as: "weeks.workouts",
          },
        },
        {
          $unwind: {
            path: "$weeks.workouts",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "exercises",
            localField: "weeks.workouts.exercises",
            foreignField: "_id",
            as: "weeks.workouts.exercises",
          },
        },
        {
          $unwind: {
            path: "$weeks.workouts.exercises",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "sets",
            localField: "weeks.workouts.exercises.sets",
            foreignField: "_id",
            as: "weeks.workouts.exercises.sets",
          },
        },
        // Group sets back into exercises, exercises into workouts, workouts into weeks, and weeks into programs
        {
          $group: {
            _id: {
              programId: "$_id",
              weekId: "$weeks._id",
              workoutId: "$weeks.workouts._id",
              exerciseId: "$weeks.workouts.exercises._id",
            },
            programName: { $first: "$name" },
            programDescription: { $first: "$description" },
            programCategory: { $first: "$category" },
            programNumWeeks: { $first: "$numWeeks" },
            programImagePath: { $first: "$imagePath" },
            programCreatedBy: { $first: "$createdBy" },
            programDifficulty: { $first: "$difficulty" },
            programCreatedAt: { $first: "$createdAt" },
            programUpdatedAt: { $first: "$updatedAt" },
            weekProgramId: { $first: "$weeks.programId" },
            weekName: { $first: "$weeks.name" },
            weekDescription: { $first: "$weeks.description" },
            weekImagePath: { $first: "$weeks.imagePath" },
            weekNumber: { $first: "$weeks.weekNumber" },
            weekCreatedAt: { $first: "$weeks.createdAt" },
            weekUpdatedAt: { $first: "$weeks.updatedAt" },
            workoutTitle: { $first: "$weeks.workouts.title" },
            workoutDescription: {
              $first: "$weeks.workouts.description",
            },
            workoutImagePath: {
              $first: "$weeks.workouts.imagePath",
            },
            workoutCompleted: {
              $first: "$weeks.workouts.completed",
            },
            workoutCreatedBy: {
              $first: "$weeks.workouts.createdBy",
            },
            workoutCreatedAt: {
              $first: "$weeks.workouts.createdAt",
            },
            workoutUpdatedAt: {
              $first: "$weeks.workouts.updatedAt",
            },
            exerciseName: {
              $first: "$weeks.workouts.exercises.name",
            },
            exerciseGroup: {
              $first: "$weeks.workouts.exercises.group",
            },
            exerciseImagePath: {
              $first: "$weeks.workouts.exercises.imagePath",
            },
            exerciseWeight: {
              $first: "$weeks.workouts.exercises.weight",
            },
            exerciseTargetSets: {
              $first: "$weeks.workouts.exercises.targetSets",
            },
            exerciseTargetReps: {
              $first: "$weeks.workouts.exercises.targetReps",
            },
            exerciseNotes: {
              $first: "$weeks.workouts.exercises.notes",
            },
            exerciseCompleted: {
              $first: "$weeks.workouts.exercises.completed",
            },
            exerciseCreatedBy: {
              $first: "$weeks.workouts.exercises.createdBy",
            },
            exerciseCreatedAt: {
              $first: "$weeks.workouts.exercises.createdAt",
            },
            exerciseUpdatedAt: {
              $first: "$weeks.workouts.exercises.updatedAt",
            },
            sets: {
              $push: {
                _id: "$weeks.workouts.exercises.sets._id",
                weight: "$weeks.workouts.exercises.sets.weight",
                reps: "$weeks.workouts.exercises.sets.reps",
                completed: "$weeks.workouts.exercises.sets.completed",
                imagePath: "$weeks.workouts.exercises.sets.imagePath",
                link: "$weeks.workouts.exercises.sets.link",
                createdBy: "$weeks.workouts.exercises.sets.createdBy",
                createdAt: "$weeks.workouts.exercises.sets.createdAt",
                updatedAt: "$weeks.workouts.exercises.sets.updatedAt",
              },
            },
          },
        },
        // Group exercises back into workouts
        {
          $group: {
            _id: {
              programId: "$_id.programId",
              weekId: "$_id.weekId",
              workoutId: "$_id.workoutId",
            },
            programName: { $first: "$name" },
            programDescription: { $first: "$description" },
            programCategory: { $first: "$category" },
            programNumWeeks: { $first: "$numWeeks" },
            programImagePath: { $first: "$imagePath" },
            programCreatedBy: { $first: "$createdBy" },
            programDifficulty: { $first: "$difficulty" },
            programCreatedAt: { $first: "$createdAt" },
            programUpdatedAt: { $first: "$updatedAt" },
            weekProgramId: { $first: "$weeks.programId" },
            weekName: { $first: "$weeks.name" },
            weekDescription: { $first: "$weeks.description" },
            weekImagePath: { $first: "$weeks.imagePath" },
            weekNumber: { $first: "$weeks.weekNumber" },
            weekCreatedAt: { $first: "$weeks.createdAt" },
            weekUpdatedAt: { $first: "$weeks.updatedAt" },
            workoutTitle: { $first: "$weeks.workouts.title" },
            workoutDescription: {
              $first: "$weeks.workouts.description",
            },
            workoutImagePath: {
              $first: "$weeks.workouts.imagePath",
            },
            workoutCompleted: {
              $first: "$weeks.workouts.completed",
            },
            workoutCreatedBy: {
              $first: "$weeks.workouts.createdBy",
            },
            workoutCreatedAt: {
              $first: "$weeks.workouts.createdAt",
            },
            workoutUpdatedAt: {
              $first: "$weeks.workouts.updatedAt",
            },
            exercises: {
              $push: {
                _id: "$_id.exerciseId",
                name: "$exerciseName",
                group: "$exerciseGroup",
                imagePath: "$exerciseImagePath",
                weight: "$exerciseWeight",
                targetSets: "$exerciseTargetSets",
                targetReps: "$exerciseTargetReps",
                notes: "$exerciseNotes",
                completed: "$exerciseCompleted",
                createdBy: "$exerciseCreatedBy",
                sets: "$sets",
                createdAt: "$exerciseCreatedAt",
                updatedAt: "$exerciseUpdatedAt",
              },
            },
          },
        },
        // Group workouts back into weeks
        {
          $group: {
            _id: {
              programId: "$_id.programId",
              weekId: "$_id.weekId",
            },
            programName: { $first: "$name" },
            programDescription: { $first: "$description" },
            programCategory: { $first: "$category" },
            programNumWeeks: { $first: "$numWeeks" },
            programImagePath: { $first: "$imagePath" },
            programCreatedBy: { $first: "$createdBy" },
            programDifficulty: { $first: "$difficulty" },
            programCreatedAt: { $first: "$createdAt" },
            programUpdatedAt: { $first: "$updatedAt" },
            weekProgramId: { $first: "$weeks.programId" },
            weekName: { $first: "$weeks.name" },
            weekDescription: { $first: "$weeks.description" },
            weekImagePath: { $first: "$weeks.imagePath" },
            weekNumber: { $first: "$weeks.weekNumber" },
            weekCreatedAt: { $first: "$weeks.createdAt" },
            weekUpdatedAt: { $first: "$weeks.updatedAt" },
            workouts: {
              $push: {
                _id: "$_id.workoutId",
                title: "$workoutTitle",
                description: "$workoutDescription",
                imagePath: "$workoutImagePath",
                completed: "$workoutCompleted",
                createdBy: "$workoutCreatedBy",
                createdAt: "$workoutCreatedAt",
                updatedAt: "$workoutUpdatedAt",
                exercises: "$exercises",
              },
            },
          },
        },
        // Group weeks back into programs
        {
          $group: {
            _id: "$_id.programId",
            name: { $first: "$programName" },
            description: { $first: "$programDescription" },
            category: { $first: "$programCategory" },
            numWeeks: { $first: "$programNumWeeks" },
            imagePath: { $first: "$programImagePath" },
            createdBy: { $first: "$programCreatedBy" },
            difficulty: { $first: "$programDifficulty" },
            createdAt: { $first: "$programCreatedAt" },
            updatedAt: { $first: "$programUpdatedAt" },
            weeks: {
              $push: {
                _id: "$_id.weekId",
                programId: "$weekProgramId",
                name: "$weekName",
                description: "$weekDescription",
                imagePath: "$weekImagePath",
                weekNumber: "$weekNumber",
                createdAt: "$weekCreatedAt",
                updatedAt: "$weekUpdatedAt",
                workouts: "$workouts",
              },
            },
          },
        },
        // Sort weeks by weekNumber
        {
          $addFields: {
            weeks: {
              $sortArray: {
                input: "$weeks",
                sortBy: { weekNumber: 1 },
              },
            },
          },
        },
      ])
      .exec();

    console.log("Group Programs: ", groupPrograms);

    return groupPrograms;
  }
}
