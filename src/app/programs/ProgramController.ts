import { NextFunction, Request, Response } from "express";
import { IProgramService } from "./ProgramService.js";
import {
  ProgramRequest,
  ProgramResponse,
  WorkoutRequest,
  WorkoutResponse,
  MealRequest,
  MealResponse,
  WeekResponse,
  WorkoutLogRequest,
  WorkoutLogResponse,
  BlockLog,
  MealLogRequest,
  NotesRequest,
  NotesResponse,
  WeekRequest,
} from "@seenelm/train-core";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { Logger } from "../../common/logger.js";
import { Types } from "mongoose";

export default class ProgramController {
  private programService: IProgramService;
  private logger: Logger;

  constructor(programService: IProgramService) {
    this.programService = programService;
    this.logger = Logger.getInstance();
  }

  public createProgram = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const programRequest: ProgramRequest = req.body;

      const programResponse: ProgramResponse =
        await this.programService.createProgram(programRequest);

      return res.status(HttpStatusCode.CREATED).json(programResponse);
    } catch (error) {
      next(error);
    }
  };

  public getProgramById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const programId = new Types.ObjectId(req.params.programId);
      const programResponse: ProgramResponse =
        await this.programService.getProgramById(programId);
      return res.status(HttpStatusCode.OK).json(programResponse);
    } catch (error) {
      next(error);
    }
  };

  public getUserPrograms = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = new Types.ObjectId(req.params.userId);

      const programs: ProgramResponse[] =
        await this.programService.getUserPrograms(userId);

      return res.status(HttpStatusCode.OK).json(programs);
    } catch (error) {
      next(error);
    }
  };

  public createWorkout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const weekId = new Types.ObjectId(req.params.weekId);
      const workoutRequest: WorkoutRequest = req.body;

      const workoutResponse: WorkoutResponse =
        await this.programService.createWorkout(weekId, workoutRequest);

      return res.status(HttpStatusCode.CREATED).json(workoutResponse);
    } catch (error) {
      next(error);
    }
  };

  public updateWorkout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const weekId = new Types.ObjectId(req.params.weekId);
      const workoutId = new Types.ObjectId(req.params.workoutId);
      const workoutRequest: WorkoutRequest = req.body;

      await this.programService.updateWorkout(
        weekId,
        workoutId,
        workoutRequest
      );

      return res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public deleteWorkout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const weekId = new Types.ObjectId(req.params.weekId);
      const workoutId = new Types.ObjectId(req.params.workoutId);

      await this.programService.deleteWorkout(weekId, workoutId);

      return res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public getWorkoutById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const weekId = new Types.ObjectId(req.params.weekId);
      const workoutId = new Types.ObjectId(req.params.workoutId);

      const workoutResponse: WorkoutResponse =
        await this.programService.getWorkoutById(weekId, workoutId);

      return res.status(HttpStatusCode.OK).json(workoutResponse);
    } catch (error) {
      next(error);
    }
  };

  public createMeal = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const weekId = new Types.ObjectId(req.params.weekId);
      const mealRequest: MealRequest = req.body;

      const mealResponse: MealResponse = await this.programService.createMeal(
        weekId,
        mealRequest
      );

      return res.status(HttpStatusCode.CREATED).json(mealResponse);
    } catch (error) {
      next(error);
    }
  };

  public updateMeal = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const weekId = new Types.ObjectId(req.params.weekId);
      const mealId = new Types.ObjectId(req.params.mealId);
      const mealRequest: MealRequest = req.body;

      await this.programService.updateMeal(weekId, mealId, mealRequest);

      return res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public deleteMeal = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const weekId = new Types.ObjectId(req.params.weekId);
      const mealId = new Types.ObjectId(req.params.mealId);

      await this.programService.deleteMeal(weekId, mealId);

      return res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public createNote = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const weekId = new Types.ObjectId(req.params.weekId);
      const noteRequest: NotesRequest = req.body;

      const noteResponse: NotesResponse = await this.programService.createNote(
        weekId,
        noteRequest
      );

      return res.status(HttpStatusCode.CREATED).json(noteResponse);
    } catch (error) {
      next(error);
    }
  };

  public updateNote = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const weekId = new Types.ObjectId(req.params.weekId);
      const noteId = new Types.ObjectId(req.params.noteId);
      const noteRequest: NotesRequest = req.body;

      await this.programService.updateNote(weekId, noteId, noteRequest);

      return res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public deleteNote = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const weekId = new Types.ObjectId(req.params.weekId);
      const noteId = new Types.ObjectId(req.params.noteId);
      await this.programService.deleteNote(weekId, noteId);

      return res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public createWorkoutLog = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const weekId = new Types.ObjectId(req.params.weekId);
      const workoutLogRequest: WorkoutLogRequest = req.body;

      const workoutLogResponse: WorkoutLogResponse =
        await this.programService.createWorkoutLog(weekId, workoutLogRequest);

      return res.status(HttpStatusCode.CREATED).json(workoutLogResponse);
    } catch (error) {
      next(error);
    }
  };

  public addBlockLog = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const weekId = new Types.ObjectId(req.params.weekId);
      const workoutLogId = new Types.ObjectId(req.params.workoutLogId);
      const blockLogRequest: BlockLog = req.body;

      await this.programService.addBlockLog(
        weekId,
        workoutLogId,
        blockLogRequest
      );

      return res.status(HttpStatusCode.CREATED).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public addMealLog = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const mealLogRequest: MealLogRequest = req.body;
      await this.programService.addMealLog(mealLogRequest);
      return res.status(HttpStatusCode.CREATED).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public getWeekWorkouts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const weekId = new Types.ObjectId(req.params.weekId);

      const workoutResponse: WorkoutResponse[] =
        await this.programService.getWeekWorkouts(weekId);

      return res.status(HttpStatusCode.OK).json(workoutResponse);
    } catch (error) {
      next(error);
    }
  };

  public getWeekMeals = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const weekId = new Types.ObjectId(req.params.weekId);

      const mealsResponse: MealResponse[] =
        await this.programService.getWeekMeals(weekId);

      return res.status(HttpStatusCode.OK).json(mealsResponse);
    } catch (error) {
      next(error);
    }
  };

  public getWeek = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const weekId = new Types.ObjectId(req.params.weekId);

      const weekResponse: WeekResponse = await this.programService.getWeek(
        weekId
      );

      return res.status(HttpStatusCode.OK).json(weekResponse);
    } catch (error) {
      next(error);
    }
  };

  public updateWeek = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const weekId = new Types.ObjectId(req.params.weekId);
      const weekRequest: WeekRequest = req.body;

      await this.programService.updateWeek(weekId, weekRequest);

      return res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };
}
