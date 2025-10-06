import { Router } from "express";
import ProgramService from "../app/programs/ProgramService.js";
import ProgramRepository from "../infrastructure/database/repositories/programs/ProgramRepository.js";
import { ProgramModel } from "../infrastructure/database/models/programs/programModel.js";
import WeekRepository from "../infrastructure/database/repositories/programs/WeekRepository.js";
import { WeekModel } from "../infrastructure/database/models/programs/weekModel.js";
import ProgramController from "../app/programs/ProgramController.js";
import ProgramMiddleware from "../app/programs/ProgramMiddleware.js";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware.js";
import UserRepository from "../infrastructure/database/repositories/user/UserRepository.js";
import { UserModel } from "../infrastructure/database/models/user/userModel.js";
import MealRepository from "../infrastructure/database/repositories/programs/MealRepository.js";
import { MealModel } from "../infrastructure/database/models/programs/mealModel.js";
import UserProgramRepository from "../infrastructure/database/repositories/programs/UserProgramRepository.js";
import { UserProgramModel } from "../infrastructure/database/models/programs/userProgramModel.js";

/**
 * @swagger
 * tags:
 *   name: Programs
 *   description: Program management
 */

const router = Router();

const authMiddleware = new AuthMiddleware(new UserRepository(UserModel));

const programService = new ProgramService(
  new ProgramRepository(ProgramModel),
  new WeekRepository(WeekModel),
  new MealRepository(MealModel),
  new UserProgramRepository(UserProgramModel)
);

const programController = new ProgramController(programService);

const programMiddleware = new ProgramMiddleware(
  new ProgramRepository(ProgramModel)
);

/**
 * @swagger
 * /program/{programId}:
 *   get:
 *     tags: [Programs]
 *     summary: Get a program by ID
 *     description: Retrieves a specific program by its ID. Only program administrators or members can access the program.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Program ID (ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Program retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 name:
 *                   type: string
 *                   example: "12-Week Strength Program"
 *                 types:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Program types
 *                   example: ["strength", "hypertrophy"]
 *                 numWeeks:
 *                   type: number
 *                   description: Number of weeks in the program
 *                   example: 12
 *                 hasNutritionProgram:
 *                   type: boolean
 *                   description: Whether the program includes nutrition
 *                   example: true
 *                 phases:
 *                   type: array
 *                   description: Program phases (optional)
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Foundation Phase"
 *                       startWeek:
 *                         type: number
 *                         example: 1
 *                       endWeek:
 *                         type: number
 *                         example: 4
 *                 accessType:
 *                   type: number
 *                   enum: [1, 2]
 *                   description: Access type (1=Public, 2=Private)
 *                   example: 1
 *                 admins:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of admin user IDs
 *                   example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *                 createdBy:
 *                   type: string
 *                   description: User ID of the creator
 *                   example: "507f1f77bcf86cd799439011"
 *                 members:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of member user IDs (optional)
 *                   example: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
 *                 weeks:
 *                   type: array
 *                   description: Array of week details (optional)
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439012"
 *                       name:
 *                         type: string
 *                         example: "Week 1 - Foundation"
 *                       description:
 *                         type: string
 *                         example: "Focus on basic movements and form"
 *                       weekNumber:
 *                         type: number
 *                         example: 1
 *       400:
 *         description: Bad request - invalid program ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not authorized to access this program
 *       404:
 *         description: Program not found
 *       500:
 *         description: Internal server error
 */
router.get("/:programId", programController.getProgramById);

/**
 * @swagger
 * /program:
 *   post:
 *     summary: Create a new program
 *     tags: [Programs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - numWeeks
 *               - accessType
 *               - admins
 *               - createdBy
 *             properties:
 *               name:
 *                 type: string
 *                 description: Program name
 *                 example: "12-Week Strength Program"
 *               types:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Program types
 *                 example: ["strength", "hypertrophy"]
 *               numWeeks:
 *                 type: number
 *                 description: Number of weeks in the program
 *                 example: 12
 *                 minimum: 1
 *                 maximum: 104
 *               hasNutritionProgram:
 *                 type: boolean
 *                 description: Whether the program includes nutrition
 *                 example: true
 *               phases:
 *                 type: array
 *                 description: Program phases (optional)
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Foundation Phase"
 *                     startWeek:
 *                       type: number
 *                       example: 1
 *                     endWeek:
 *                       type: number
 *                       example: 4
 *               accessType:
 *                 type: number
 *                 enum: [1, 2]
 *                 description: Program access type (1=Public, 2=Private)
 *                 example: 1
 *               admins:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of admin user IDs
 *                 example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of member user IDs (optional)
 *                 example: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
 *               createdBy:
 *                 type: string
 *                 description: User ID of the creator
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       201:
 *         description: Program created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 name:
 *                   type: string
 *                   example: "12-Week Strength Program"
 *                 numWeeks:
 *                   type: number
 *                   example: 12
 *                 accessType:
 *                   type: number
 *                   example: 1
 *                 admins:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *                 members:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
 *                 createdBy:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Program validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Program name is required", "Program duration must be between 1 and 104 weeks"]
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authMiddleware.authenticateToken,
  ProgramMiddleware.validateCreateProgram,
  programController.createProgram
);

router.delete(
  "/:programId",
  authMiddleware.authenticateToken,
  programMiddleware.checkAdminAuthorization,
  programController.deleteProgram
);

/**
 * @swagger
 * /program/{programId}/week/{weekId}:
 *   put:
 *     tags: [Programs]
 *     summary: Update a week
 *     description: Updates an existing week within a specific program. Only program administrators can update weeks.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *         description: Week ID
 *         example: "507f1f77bcf86cd799439012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - weekNumber
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Week name (optional)
 *                 example: "Week 1 - Foundation"
 *               description:
 *                 type: string
 *                 description: Week description (optional)
 *                 example: "Focus on basic movements and establishing good form"
 *               weekNumber:
 *                 type: number
 *                 description: Week number in the program
 *                 example: 1
 *                 minimum: 1
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Week start date
 *                 example: "2024-01-15"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Week end date
 *                 example: "2024-01-21"
 *     responses:
 *       200:
 *         description: Week updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                   description: Indicates the week was successfully updated
 *       400:
 *         description: Bad request - validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a program administrator
 *       404:
 *         description: Program or week not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:programId/week/:weekId",
  authMiddleware.authenticateToken,
  programMiddleware.checkAdminAuthorization,
  ProgramMiddleware.validateWeekRequest,
  programController.updateWeek
);

router.delete(
  "/:programId/week/:weekId",
  authMiddleware.authenticateToken,
  programMiddleware.checkAdminAuthorization,
  programController.deleteWeek
);

/**
 * @swagger
 * /program/user/{userId}:
 *   get:
 *     summary: Get all programs for a specific user
 *     tags: [Programs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: User ID (ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: List of programs for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "507f1f77bcf86cd799439011"
 *                   name:
 *                     type: string
 *                     example: "12-Week Strength Program"
 *                   types:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["strength", "hypertrophy"]
 *                   numWeeks:
 *                     type: number
 *                     example: 12
 *                   hasNutritionProgram:
 *                     type: boolean
 *                     example: true
 *                   phases:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Foundation Phase"
 *                         startWeek:
 *                           type: number
 *                           example: 1
 *                         endWeek:
 *                           type: number
 *                           example: 4
 *                   accessType:
 *                     type: number
 *                     enum: [1, 2]
 *                     description: Access type (1=Public, 2=Private)
 *                     example: 1
 *                   admins:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Array of admin user IDs
 *                     example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *                   createdBy:
 *                     type: string
 *                     description: User ID of the creator
 *                     example: "507f1f77bcf86cd799439011"
 *                   members:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Array of member user IDs (optional)
 *                     example: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
 *                   weeks:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439012"
 *                         name:
 *                           type: string
 *                           example: "Week 1 - Foundation"
 *                         description:
 *                           type: string
 *                           example: "Focus on basic movements and form"
 *                         weekNumber:
 *                           type: number
 *                           example: 1
 *       400:
 *         description: Bad request - invalid user ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/user/:userId",
  authMiddleware.authenticateToken,
  programController.getUserPrograms
);

/**
 * @swagger
 * /program/{programId}/week/{weekId}/workout:
 *   post:
 *     tags: [Programs]
 *     summary: Create a new workout for a program
 *     description: Creates a new workout within a specific program. Only program administrators can create workouts.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *         description: Week ID
 *         example: "507f1f77bcf86cd799439012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - accessType
 *               - createdBy
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Workout name
 *                 example: "Upper Body Strength"
 *               description:
 *                 type: string
 *                 description: Workout description
 *                 example: "Focus on upper body muscle groups"
 *               category:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Workout categories
 *                 example: ["strength", "upper-body"]
 *               difficulty:
 *                 type: string
 *                 enum: ["beginner", "intermediate", "advanced"]
 *                 description: Workout difficulty level
 *                 example: "intermediate"
 *               duration:
 *                 type: number
 *                 description: Estimated workout duration in minutes
 *                 example: 60
 *               blocks:
 *                 type: array
 *                 description: Workout blocks/exercises
 *                 items:
 *                   type: object
 *                   required:
 *                     - type
 *                     - exercises
 *                     - order
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: ["single", "superset", "cluster", "circuit", "giant set", "every minute on the minute", "as many reps/rounds as possible"]
 *                       description: Type of workout block
 *                       example: "single"
 *                     name:
 *                       type: string
 *                       description: Block name
 *                       example: "Main Strength Block"
 *                     description:
 *                       type: string
 *                       description: Block description
 *                       example: "Focus on compound movements"
 *                     restBetweenExercisesSec:
 *                       type: number
 *                       description: Rest time between exercises in seconds
 *                       example: 60
 *                     restAfterBlockSec:
 *                       type: number
 *                       description: Rest time after block completion in seconds
 *                       example: 120
 *                     exercises:
 *                       type: array
 *                       description: Array of exercises in this block
 *                       items:
 *                         type: object
 *                         required:
 *                           - name
 *                           - order
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: Exercise name
 *                             example: "Bench Press"
 *                           targetSets:
 *                             type: number
 *                             description: Target number of sets
 *                             example: 3
 *                           targetReps:
 *                             type: number
 *                             description: Target number of reps
 *                             example: 10
 *                           targetDurationSec:
 *                             type: number
 *                             description: Target duration in seconds
 *                             example: 45
 *                           targetWeight:
 *                             type: number
 *                             description: Target weight
 *                             example: 135
 *                           notes:
 *                             type: string
 *                             description: Exercise notes
 *                             example: "Focus on controlled movement"
 *                           order:
 *                             type: number
 *                             description: Order of exercise in the block
 *                             example: 1
 *                     order:
 *                       type: number
 *                       description: Order of block in the workout
 *                       example: 1
 *               accessType:
 *                 type: number
 *                 enum: [1, 2]
 *                 description: Access type (1=Public, 2=Private)
 *                 example: 1
 *               createdBy:
 *                 type: string
 *                 description: Creator user ID
 *                 example: "507f1f77bcf86cd799439011"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Workout start date
 *                 example: "2024-01-15"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Workout end date
 *                 example: "2024-01-15"
 *     responses:
 *       201:
 *         description: Workout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439012"
 *                 name:
 *                   type: string
 *                   example: "Upper Body Strength"
 *                 description:
 *                   type: string
 *                   example: "Focus on upper body muscle groups"
 *                 category:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["strength", "upper-body"]
 *                 difficulty:
 *                   type: string
 *                   example: "intermediate"
 *                 duration:
 *                   type: number
 *                   example: 60
 *                 blocks:
 *                   type: array
 *                 accessType:
 *                   type: number
 *                   example: 1
 *                 createdBy:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-15"
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-15"
 *       400:
 *         description: Bad request - validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a program administrator
 *       404:
 *         description: Program not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:programId/week/:weekId/workout",
  authMiddleware.authenticateToken,
  programMiddleware.checkAdminAuthorization,
  ProgramMiddleware.validateWorkoutRequest,
  programController.createWorkout
);

/**
 * @swagger
 * /program/{programId}/week/{weekId}/workout/{workoutId}:
 *   put:
 *     tags: [Programs]
 *     summary: Update a workout
 *     description: Updates an existing workout within a specific program. Only program administrators can update workouts. The version number will be incremented by 1.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *         description: Week ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID
 *         example: "507f1f77bcf86cd799439013"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - accessType
 *               - createdBy
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Workout name
 *                 example: "Updated Upper Body Strength"
 *               description:
 *                 type: string
 *                 description: Workout description
 *                 example: "Updated focus on upper body muscle groups"
 *               category:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Workout categories
 *                 example: ["strength", "upper-body"]
 *               difficulty:
 *                 type: string
 *                 enum: ["beginner", "intermediate", "advanced"]
 *                 description: Workout difficulty level
 *                 example: "intermediate"
 *               duration:
 *                 type: number
 *                 description: Estimated workout duration in minutes
 *                 example: 60
 *               blocks:
 *                 type: array
 *                 description: Workout blocks/exercises
 *                 items:
 *                   type: object
 *                   required:
 *                     - type
 *                     - exercises
 *                     - order
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: ["single", "superset", "cluster", "circuit", "giant set", "every minute on the minute", "as many reps/rounds as possible"]
 *                       description: Type of workout block
 *                       example: "single"
 *                     name:
 *                       type: string
 *                       description: Block name
 *                       example: "Main Strength Block"
 *                     description:
 *                       type: string
 *                       description: Block description
 *                       example: "Focus on compound movements"
 *                     restBetweenExercisesSec:
 *                       type: number
 *                       description: Rest time between exercises in seconds
 *                       example: 60
 *                     restAfterBlockSec:
 *                       type: number
 *                       description: Rest time after block completion in seconds
 *                       example: 120
 *                     exercises:
 *                       type: array
 *                       description: Array of exercises in this block
 *                       items:
 *                         type: object
 *                         required:
 *                           - name
 *                           - order
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: Exercise name
 *                             example: "Bench Press"
 *                           targetSets:
 *                             type: number
 *                             description: Target number of sets
 *                             example: 3
 *                           targetReps:
 *                             type: number
 *                             description: Target number of reps
 *                             example: 10
 *                           targetDurationSec:
 *                             type: number
 *                             description: Target duration in seconds
 *                             example: 45
 *                           targetWeight:
 *                             type: number
 *                             description: Target weight
 *                             example: 135
 *                           notes:
 *                             type: string
 *                             description: Exercise notes
 *                             example: "Focus on controlled movement"
 *                           order:
 *                             type: number
 *                             description: Order of exercise in the block
 *                             example: 1
 *                     order:
 *                       type: number
 *                       description: Order of block in the workout
 *                       example: 1
 *               accessType:
 *                 type: number
 *                 enum: [1, 2]
 *                 description: Access type (1=Public, 2=Private)
 *                 example: 1
 *               createdBy:
 *                 type: string
 *                 description: Creator user ID
 *                 example: "507f1f77bcf86cd799439011"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Workout start date
 *                 example: "2024-01-15"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Workout end date
 *                 example: "2024-01-15"
 *     responses:
 *       200:
 *         description: Workout updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                   description: Indicates the workout was successfully updated
 *       400:
 *         description: Bad request - validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a program administrator
 *       404:
 *         description: Program, week, or workout not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:programId/week/:weekId/workout/:workoutId",
  authMiddleware.authenticateToken,
  programMiddleware.checkAdminAuthorization,
  ProgramMiddleware.validateWorkoutRequest,
  programController.updateWorkout
);

/**
 * @swagger
 * /program/{programId}/week/{weekId}/workout/{workoutId}:
 *   delete:
 *     tags: [Programs]
 *     summary: Delete a workout
 *     description: Deletes an existing workout from a specific program week. Only program administrators can delete workouts.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *         description: Week ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Workout deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                   description: Indicates the workout was successfully deleted
 *       400:
 *         description: Bad request - invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a program administrator
 *       404:
 *         description: Program, week, or workout not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:programId/week/:weekId/workout/:workoutId",
  authMiddleware.authenticateToken,
  programMiddleware.checkAdminAuthorization,
  programController.deleteWorkout
);

/**
 * @swagger
 * /program/{programId}/week/{weekId}/workout/{workoutId}:
 *   get:
 *     tags: [Programs]
 *     summary: Get a workout by ID
 *     description: Retrieves a specific workout from a program week. Only program administrators or members can access this resource.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *         description: Week ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Workout retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439013"
 *                 name:
 *                   type: string
 *                   example: "Upper Body Strength"
 *                 description:
 *                   type: string
 *                   example: "Focus on chest, back, and arms"
 *                 category:
 *                   type: string
 *                   example: "strength"
 *                 difficulty:
 *                   type: string
 *                   enum: ["beginner", "intermediate", "advanced"]
 *                   example: "intermediate"
 *                 duration:
 *                   type: number
 *                   example: 60
 *                 blocks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: ["single", "superset", "cluster", "circuit", "giant set", "every minute on the minute", "as many reps/rounds as possible"]
 *                         example: "single"
 *                       name:
 *                         type: string
 *                         example: "Chest Press"
 *                       exercises:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Bench Press"
 *                             sets:
 *                               type: number
 *                               example: 3
 *                             reps:
 *                               type: number
 *                               example: 10
 *                             durationSec:
 *                               type: number
 *                               example: 60
 *                             weight:
 *                               type: number
 *                               example: 135
 *                             order:
 *                               type: number
 *                               example: 1
 *                       order:
 *                         type: number
 *                         example: 1
 *                 accessType:
 *                   type: number
 *                   enum: [1, 2]
 *                   example: 1
 *                 createdBy:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-15"
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-21"
 *                 versionId:
 *                   type: number
 *                   example: 1
 *       400:
 *         description: Bad request - invalid parameters
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       403:
 *         description: Forbidden - user is not authorized to access this resource
 *       404:
 *         description: Program, week, or workout not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:programId/week/:weekId/workout/:workoutId",
  authMiddleware.authenticateToken,
  programController.getWorkoutById
);

/**
 * @swagger
 * /program/{programId}/week/{weekId}/meal:
 *   post:
 *     tags: [Programs]
 *     summary: Create a new meal for a program week
 *     description: Creates a new meal within a specific program week. Only program administrators can create meals.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *         description: Week ID
 *         example: "507f1f77bcf86cd799439012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - createdBy
 *               - mealName
 *               - startDate
 *               - endDate
 *             properties:
 *               createdBy:
 *                 type: string
 *                 description: Creator user ID
 *                 example: "507f1f77bcf86cd799439011"
 *               mealName:
 *                 type: string
 *                 description: Name of the meal
 *                 example: "Grilled Chicken Breast"
 *               macros:
 *                 type: object
 *                 description: Nutritional macros (optional)
 *                 properties:
 *                   protein:
 *                     type: number
 *                     description: Protein in grams
 *                     example: 30
 *                   carbs:
 *                     type: number
 *                     description: Carbohydrates in grams
 *                     example: 5
 *                   fats:
 *                     type: number
 *                     description: Fats in grams
 *                     example: 8
 *               ingredients:
 *                 type: array
 *                 description: List of ingredients (optional)
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - portion
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Ingredient name
 *                       example: "Chicken Breast"
 *                     portion:
 *                       type: object
 *                       required:
 *                         - amount
 *                         - unit
 *                       properties:
 *                         amount:
 *                           type: number
 *                           description: Amount of ingredient
 *                           example: 200
 *                         unit:
 *                           type: string
 *                           enum: ["g", "kg", "oz", "lb", "ml", "l", "cup", "tbsp", "tsp", "piece"]
 *                           description: Unit of measurement
 *                           example: "g"
 *               instructions:
 *                 type: string
 *                 description: Cooking instructions (optional)
 *                 example: "Season chicken with salt and pepper, grill for 6-7 minutes per side"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Meal start date
 *                 example: "2024-01-15"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Meal end date
 *                 example: "2024-01-15"
 *     responses:
 *       201:
 *         description: Meal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439013"
 *                 versionId:
 *                   type: number
 *                   example: 1
 *                 createdBy:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 mealName:
 *                   type: string
 *                   example: "Grilled Chicken Breast"
 *                 macros:
 *                   type: object
 *                   properties:
 *                     protein:
 *                       type: number
 *                       example: 30
 *                     carbs:
 *                       type: number
 *                       example: 5
 *                     fats:
 *                       type: number
 *                       example: 8
 *                 ingredients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Chicken Breast"
 *                       portion:
 *                         type: object
 *                         properties:
 *                           amount:
 *                             type: number
 *                             example: 200
 *                           unit:
 *                             type: string
 *                             example: "g"
 *                 instructions:
 *                   type: string
 *                   example: "Season chicken with salt and pepper, grill for 6-7 minutes per side"
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-15"
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-15"
 *       400:
 *         description: Bad request - validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a program administrator
 *       404:
 *         description: Program or week not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:programId/week/:weekId/meal",
  authMiddleware.authenticateToken,
  programMiddleware.checkAdminAuthorization,
  ProgramMiddleware.validateMealRequest,
  programController.createMeal
);

/**
 * @swagger
 * /program/{programId}/week/{weekId}/meal/{mealId}:
 *   put:
 *     tags: [Programs]
 *     summary: Update a meal
 *     description: Updates an existing meal within a specific program week. Only program administrators can update meals. The version number will be incremented by 1.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *         description: Week ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: path
 *         name: mealId
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal ID
 *         example: "507f1f77bcf86cd799439013"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - createdBy
 *               - mealName
 *               - startDate
 *               - endDate
 *             properties:
 *               createdBy:
 *                 type: string
 *                 description: Creator user ID
 *                 example: "507f1f77bcf86cd799439011"
 *               mealName:
 *                 type: string
 *                 description: Name of the meal
 *                 example: "Updated Grilled Chicken Breast"
 *               macros:
 *                 type: object
 *                 description: Nutritional macros (optional)
 *                 properties:
 *                   protein:
 *                     type: number
 *                     description: Protein in grams
 *                     example: 35
 *                   carbs:
 *                     type: number
 *                     description: Carbohydrates in grams
 *                     example: 8
 *                   fats:
 *                     type: number
 *                     description: Fats in grams
 *                     example: 10
 *               ingredients:
 *                 type: array
 *                 description: List of ingredients (optional)
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - portion
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Ingredient name
 *                       example: "Chicken Breast"
 *                     portion:
 *                       type: object
 *                       required:
 *                         - amount
 *                         - unit
 *                       properties:
 *                         amount:
 *                           type: number
 *                           description: Amount of ingredient
 *                           example: 250
 *                         unit:
 *                           type: string
 *                           enum: ["g", "kg", "oz", "lb", "ml", "l", "cup", "tbsp", "tsp", "piece"]
 *                           description: Unit of measurement
 *                           example: "g"
 *               instructions:
 *                 type: string
 *                 description: Cooking instructions (optional)
 *                 example: "Updated: Season chicken with salt, pepper, and herbs, grill for 7-8 minutes per side"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Meal start date
 *                 example: "2024-01-15"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Meal end date
 *                 example: "2024-01-15"
 *     responses:
 *       200:
 *         description: Meal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                   description: Indicates the meal was successfully updated
 *       400:
 *         description: Bad request - validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a program administrator
 *       404:
 *         description: Program, week, or meal not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:programId/week/:weekId/meal/:mealId",
  authMiddleware.authenticateToken,
  programMiddleware.checkAdminAuthorization,
  ProgramMiddleware.validateMealRequest,
  programController.updateMeal
);

/**
 * @swagger
 * /program/{programId}/week/{weekId}/meal/{mealId}:
 *   delete:
 *     tags: [Programs]
 *     summary: Delete a meal
 *     description: Deletes an existing meal from a specific program week. Only program administrators can delete meals.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *         description: Week ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: path
 *         name: mealId
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal ID
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Meal deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                   description: Indicates the meal was successfully deleted
 *       400:
 *         description: Bad request - invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a program administrator
 *       404:
 *         description: Program, week, or meal not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:programId/week/:weekId/meal/:mealId",
  authMiddleware.authenticateToken,
  programMiddleware.checkAdminAuthorization,
  programController.deleteMeal
);

/**
 * @swagger
 * /program/{programId}/week/{weekId}/note:
 *   post:
 *     tags: [Programs]
 *     summary: Create a new note for a program week
 *     description: Creates a new note within a specific program week. Only program administrators can create notes.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *         description: Week ID
 *         example: "507f1f77bcf86cd799439012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - createdBy
 *               - title
 *               - content
 *               - startDate
 *               - endDate
 *             properties:
 *               createdBy:
 *                 type: string
 *                 description: User ID of the note creator
 *                 example: "507f1f77bcf86cd799439011"
 *               title:
 *                 type: string
 *                 description: Title of the note
 *                 example: "Week 1 Training Notes"
 *               content:
 *                 type: string
 *                 description: Content of the note
 *                 example: "Focus on proper form and technique. Start with lighter weights to establish good movement patterns."
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Note start date
 *                 example: "2024-01-15"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Note end date
 *                 example: "2024-01-21"
 *     responses:
 *       201:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439013"
 *                 createdBy:
 *                   type: string
 *                   description: User ID of the note creator
 *                   example: "507f1f77bcf86cd799439011"
 *                 title:
 *                   type: string
 *                   example: "Week 1 Training Notes"
 *                 content:
 *                   type: string
 *                   example: "Focus on proper form and technique. Start with lighter weights to establish good movement patterns."
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-15"
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-21"
 *       400:
 *         description: Bad request - validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a program administrator
 *       404:
 *         description: Program or week not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:programId/week/:weekId/note",
  authMiddleware.authenticateToken,
  programMiddleware.checkAdminAuthorization,
  ProgramMiddleware.validateNoteRequest,
  programController.createNote
);

/**
 * @swagger
 * /program/{programId}/week/{weekId}/note/{noteId}:
 *   put:
 *     tags: [Programs]
 *     summary: Update a note
 *     description: Updates an existing note within a specific program week. Only program administrators can update notes.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *         description: Week ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *         example: "507f1f77bcf86cd799439013"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - createdBy
 *               - title
 *               - content
 *               - startDate
 *               - endDate
 *             properties:
 *               createdBy:
 *                 type: string
 *                 description: User ID of the note creator
 *                 example: "507f1f77bcf86cd799439011"
 *               title:
 *                 type: string
 *                 description: Title of the note
 *                 example: "Updated Week 1 Training Notes"
 *               content:
 *                 type: string
 *                 description: Content of the note
 *                 example: "Updated: Focus on proper form and technique. Start with lighter weights to establish good movement patterns. Pay attention to breathing during exercises."
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Note start date
 *                 example: "2024-01-15"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Note end date
 *                 example: "2024-01-21"
 *     responses:
 *       200:
 *         description: Note updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                   description: Indicates the note was successfully updated
 *       400:
 *         description: Bad request - validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a program administrator
 *       404:
 *         description: Program, week, or note not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:programId/week/:weekId/note/:noteId",
  authMiddleware.authenticateToken,
  programMiddleware.checkAdminAuthorization,
  ProgramMiddleware.validateNoteRequest,
  programController.updateNote
);

/**
 * @swagger
 * /program/{programId}/week/{weekId}/note/{noteId}:
 *   delete:
 *     tags: [Programs]
 *     summary: Delete a note
 *     description: Deletes an existing note from a specific program week. Only program administrators can delete notes.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *         description: Week ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Note ID
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                   description: Indicates the note was successfully deleted
 *       400:
 *         description: Bad request - invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not a program administrator
 *       404:
 *         description: Program, week, or note not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:programId/week/:weekId/note/:noteId",
  authMiddleware.authenticateToken,
  programMiddleware.checkAdminAuthorization,
  programController.deleteNote
);

/**
 * @swagger
 * /program/{programId}/week/{weekId}/workout/log:
 *   post:
 *     tags: [Programs]
 *     summary: Create a workout log
 *     description: Creates a new workout log entry for a specific week. Only program administrators or members can access this resource.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *         description: Week ID
 *         example: "507f1f77bcf86cd799439012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - workoutId
 *               - versionId
 *               - workoutSnapshot
 *               - actualDuration
 *               - actualStartDate
 *               - actualEndDate
 *               - isCompleted
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user performing the workout
 *                 example: "507f1f77bcf86cd799439011"
 *               workoutId:
 *                 type: string
 *                 description: ID of the workout being logged
 *                 example: "507f1f77bcf86cd799439012"
 *               versionId:
 *                 type: number
 *                 description: Version of the workout
 *                 example: 1
 *               workoutSnapshot:
 *                 type: object
 *                 description: Snapshot of the workout at the time of logging
 *                 required:
 *                   - name
 *                   - blocks
 *                   - accessType
 *                   - createdBy
 *                   - startDate
 *                   - endDate
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Workout name
 *                     example: "Upper Body Strength"
 *                   description:
 *                     type: string
 *                     description: Workout description (optional)
 *                     example: "Focus on upper body muscle groups"
 *                   category:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Workout categories (optional)
 *                     example: ["strength", "upper-body"]
 *                   difficulty:
 *                     type: string
 *                     enum: ["beginner", "intermediate", "advanced"]
 *                     description: Workout difficulty level (optional)
 *                     example: "intermediate"
 *                   duration:
 *                     type: number
 *                     description: Workout duration in minutes (optional)
 *                     example: 60
 *                   blocks:
 *                     type: array
 *                     description: Workout blocks/exercises
 *                     items:
 *                       type: object
 *                       required:
 *                         - type
 *                         - exercises
 *                         - order
 *                       properties:
 *                         type:
 *                           type: string
 *                           enum: ["single", "superset", "cluster", "circuit", "giant set", "every minute on the minute", "as many reps/rounds as possible"]
 *                           example: "single"
 *                         name:
 *                           type: string
 *                           example: "Main Strength Block"
 *                         description:
 *                           type: string
 *                           example: "Focus on compound movements"
 *                         restBetweenExercisesSec:
 *                           type: number
 *                           example: 60
 *                         restAfterBlockSec:
 *                           type: number
 *                           example: 120
 *                         exercises:
 *                           type: array
 *                           items:
 *                             type: object
 *                             required:
 *                               - name
 *                               - order
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Bench Press"
 *                               targetSets:
 *                                 type: number
 *                                 example: 3
 *                               targetReps:
 *                                 type: number
 *                                 example: 10
 *                               targetDurationSec:
 *                                 type: number
 *                                 example: 45
 *                               targetWeight:
 *                                 type: number
 *                                 example: 135
 *                               notes:
 *                                 type: string
 *                                 example: "Focus on controlled movement"
 *                               order:
 *                                 type: number
 *                                 example: 1
 *                         order:
 *                           type: number
 *                           example: 1
 *                   accessType:
 *                     type: number
 *                     enum: [1, 2]
 *                     description: Access type (1=Public, 2=Private)
 *                     example: 1
 *                   createdBy:
 *                     type: string
 *                     description: Creator user ID
 *                     example: "507f1f77bcf86cd799439011"
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     description: Workout start date
 *                     example: "2024-01-15"
 *                   endDate:
 *                     type: string
 *                     format: date
 *                     description: Workout end date
 *                     example: "2024-01-15"
 *               blockLogs:
 *                 type: array
 *                 description: Array of block logs (optional)
 *                 items:
 *                   type: object
 *                   required:
 *                     - exerciseLogs
 *                     - order
 *                     - isCompleted
 *                   properties:
 *                     actualRestBetweenExercisesSec:
 *                       type: number
 *                       description: Actual rest time between exercises in seconds
 *                       example: 60
 *                     actualRestAfterBlockSec:
 *                       type: number
 *                       description: Actual rest time after block completion in seconds
 *                       example: 120
 *                     exerciseLogs:
 *                       type: array
 *                       description: Array of exercise logs for this block
 *                       items:
 *                         type: object
 *                         required:
 *                           - name
 *                           - isCompleted
 *                           - order
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: Exercise name
 *                             example: "Bench Press"
 *                           actualSets:
 *                             type: number
 *                             description: Actual number of sets performed
 *                             example: 3
 *                           actualReps:
 *                             type: number
 *                             description: Actual number of reps performed
 *                             example: 10
 *                           actualDurationSec:
 *                             type: number
 *                             description: Actual duration in seconds
 *                             example: 45
 *                           actualWeight:
 *                             type: number
 *                             description: Actual weight used
 *                             example: 135
 *                           isCompleted:
 *                             type: boolean
 *                             description: Whether the exercise was completed
 *                             example: true
 *                           order:
 *                             type: number
 *                             description: Order of the exercise in the block
 *                             example: 1
 *                     order:
 *                       type: number
 *                       description: Order of the block in the workout
 *                       example: 1
 *                     isCompleted:
 *                       type: boolean
 *                       description: Whether the entire block was completed
 *                       example: true
 *               actualDuration:
 *                 type: number
 *                 description: Actual duration of the workout in minutes
 *                 example: 65
 *               actualStartDate:
 *                 oneOf:
 *                   - type: string
 *                     format: date
 *                   - type: string
 *                     format: date-time
 *                 description: Actual start time of the workout (accepts date or datetime)
 *                 example: "2024-01-15"
 *               actualEndDate:
 *                 oneOf:
 *                   - type: string
 *                     format: date
 *                   - type: string
 *                     format: date-time
 *                 description: Actual end time of the workout (accepts date or datetime)
 *                 example: "2024-01-15"
 *               isCompleted:
 *                 type: boolean
 *                 description: Whether the workout was completed
 *                 example: true
 *     responses:
 *       201:
 *         description: Workout log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439013"
 *                 userId:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 workoutId:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439012"
 *                 versionId:
 *                   type: number
 *                   example: 1
 *                 workoutSnapshot:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Upper Body Strength"
 *                     description:
 *                       type: string
 *                       example: "Focus on upper body muscle groups"
 *                     category:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["strength", "upper-body"]
 *                     difficulty:
 *                       type: string
 *                       example: "intermediate"
 *                     duration:
 *                       type: number
 *                       example: 60
 *                     blockSnapshot:
 *                       type: array
 *                       description: Workout blocks/exercises
 *                     accessType:
 *                       type: string
 *                       example: "0"
 *                     createdBy:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     startDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T09:00:00Z"
 *                     endDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:00:00Z"
 *                 blockLogs:
 *                   type: array
 *                   description: Array of block logs
 *                   items:
 *                     type: object
 *                     properties:
 *                       actualRestBetweenExercisesSec:
 *                         type: number
 *                         example: 60
 *                       actualRestAfterBlockSec:
 *                         type: number
 *                         example: 120
 *                       exerciseLogs:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             exerciseId:
 *                               type: string
 *                               example: "bench-press"
 *                             actualSets:
 *                               type: number
 *                               example: 3
 *                             actualReps:
 *                               type: number
 *                               example: 10
 *                             actualWeight:
 *                               type: number
 *                               example: 135
 *                             isCompleted:
 *                               type: boolean
 *                               example: true
 *                             order:
 *                               type: number
 *                               example: 1
 *                       order:
 *                         type: number
 *                         example: 1
 *                       isCompleted:
 *                         type: boolean
 *                         example: true
 *                 actualDuration:
 *                   type: number
 *                   example: 65
 *                 actualStartDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T09:00:00Z"
 *                 actualEndDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:05:00Z"
 *                 isCompleted:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Bad request - validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not a program administrator or member
 *       404:
 *         description: Week not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:programId/week/:weekId/workout/log",
  authMiddleware.authenticateToken,
  // programMiddleware.checkMemberOrAdminAuthorization,
  ProgramMiddleware.validateWorkoutLogRequest,
  programController.createWorkoutLog
);

/**
 * @swagger
 * /program/{programId}/week/{weekId}/workout/log/block:
 *   post:
 *     tags: [Programs]
 *     summary: Add a block log to a workout log
 *     description: Adds a block log entry to an existing workout log within a specific week. Only program administrators or members can access this resource.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *         description: Week ID
 *         example: "507f1f77bcf86cd799439012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workoutLogId
 *               - blockLog
 *             properties:
 *               workoutLogId:
 *                 type: string
 *                 description: ID of the workout log to add the block log to
 *                 example: "507f1f77bcf86cd799439013"
 *               blockLog:
 *                 type: object
 *                 required:
 *                   - exerciseLogs
 *                   - order
 *                   - isCompleted
 *                 properties:
 *                   actualRestBetweenExercisesSec:
 *                     type: number
 *                     description: Actual rest time between exercises in seconds
 *                     example: 60
 *                   actualRestAfterBlockSec:
 *                     type: number
 *                     description: Actual rest time after the block in seconds
 *                     example: 120
 *                   exerciseLogs:
 *                     type: array
 *                     description: Array of exercise logs for this block
 *                     items:
 *                       type: object
 *                       required:
 *                         - exerciseId
 *                         - isCompleted
 *                         - order
 *                       properties:
 *                         exerciseId:
 *                           type: string
 *                           description: ID of the exercise
 *                           example: "bench-press"
 *                         actualSets:
 *                           type: number
 *                           description: Actual number of sets performed
 *                           example: 3
 *                         actualReps:
 *                           type: number
 *                           description: Actual number of reps performed
 *                           example: 10
 *                         actualDurationSec:
 *                           type: number
 *                           description: Actual duration in seconds
 *                           example: 45
 *                         actualWeight:
 *                           type: number
 *                           description: Actual weight used
 *                           example: 135
 *                         isCompleted:
 *                           type: boolean
 *                           description: Whether the exercise was completed
 *                           example: true
 *                         order:
 *                           type: number
 *                           description: Order of the exercise in the block
 *                           example: 1
 *                   order:
 *                     type: number
 *                     description: Order of the block in the workout
 *                     example: 1
 *                   isCompleted:
 *                     type: boolean
 *                     description: Whether the entire block was completed
 *                     example: true
 *     responses:
 *       201:
 *         description: Block log added to workout log successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Block log added to workout log successfully"
 *       400:
 *         description: Bad request - validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Block log request validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "blockLog.exerciseLogs"
 *                       message:
 *                         type: string
 *                         example: "Block must have at least one exercise log"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not a program administrator or member
 *       404:
 *         description: Week or workout log not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:programId/week/:weekId/workout/log/:workoutLogId/block",
  authMiddleware.authenticateToken,
  // programMiddleware.checkMemberOrAdminAuthorization,
  ProgramMiddleware.validateBlockLogRequest,
  programController.addBlockLog
);

/**
 * @swagger
 * /program/{programId}/week/{weekId}/meal/log:
 *   post:
 *     tags: [Programs]
 *     summary: Add a meal log to a week
 *     description: Creates a new meal log entry for a specific week. Only program administrators or members can access this resource.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Program ID (ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Week ID (ObjectId)
 *         example: "507f1f77bcf86cd799439012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - versionId
 *               - userId
 *               - mealId
 *               - mealSnapshot
 *               - isCompleted
 *               - actualStartDate
 *               - actualEndDate
 *             properties:
 *               versionId:
 *                 type: number
 *                 description: Version of the meal
 *                 example: 1
 *               userId:
 *                 type: string
 *                 description: ID of the user logging the meal
 *                 example: "507f1f77bcf86cd799439011"
 *               mealId:
 *                 type: string
 *                 description: ID of the meal being logged
 *                 example: "507f1f77bcf86cd799439012"
 *               mealSnapshot:
 *                 type: object
 *                 description: Snapshot of the meal at the time of logging
 *                 required:
 *                   - createdBy
 *                   - mealName
 *                   - startDate
 *                   - endDate
 *                 properties:
 *                   createdBy:
 *                     type: string
 *                     description: Creator user ID
 *                     example: "507f1f77bcf86cd799439011"
 *                   mealName:
 *                     type: string
 *                     description: Name of the meal
 *                     example: "Breakfast - Protein Pancakes"
 *                   macrosSnapshot:
 *                     type: object
 *                     description: Macro nutrients snapshot (optional)
 *                     properties:
 *                       protein:
 *                         type: number
 *                         description: Protein in grams
 *                         example: 25
 *                       carbs:
 *                         type: number
 *                         description: Carbohydrates in grams
 *                         example: 30
 *                       fats:
 *                         type: number
 *                         description: Fats in grams
 *                         example: 15
 *                   ingredientSnapshot:
 *                     type: array
 *                     description: Ingredients snapshot (optional)
 *                     items:
 *                       type: object
 *                       required:
 *                         - name
 *                         - portionSnapshot
 *                       properties:
 *                         name:
 *                           type: string
 *                           description: Ingredient name
 *                           example: "Oats"
 *                         portionSnapshot:
 *                           type: object
 *                           required:
 *                             - amount
 *                             - unit
 *                           properties:
 *                             amount:
 *                               type: number
 *                               description: Amount of ingredient
 *                               example: 50
 *                             unit:
 *                               type: string
 *                               enum: ["g", "kg", "ml", "l", "cup", "tbsp", "tsp", "oz", "lb"]
 *                               description: Unit of measurement
 *                               example: "g"
 *                   instructions:
 *                     type: string
 *                     description: Cooking instructions (optional)
 *                     example: "Mix all ingredients and cook on medium heat"
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     description: Meal start date
 *                     example: "2024-01-15"
 *                   endDate:
 *                     type: string
 *                     format: date
 *                     description: Meal end date
 *                     example: "2024-01-15"
 *               actualMacros:
 *                 type: object
 *                 description: Actual macro nutrients consumed (optional)
 *                 properties:
 *                   protein:
 *                     type: number
 *                     description: Actual protein consumed in grams
 *                     example: 23
 *                   carbs:
 *                     type: number
 *                     description: Actual carbohydrates consumed in grams
 *                     example: 28
 *                   fats:
 *                     type: number
 *                     description: Actual fats consumed in grams
 *                     example: 14
 *               actualIngredients:
 *                 type: array
 *                 description: Actual ingredients consumed (optional)
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - portion
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Ingredient name
 *                       example: "Oats"
 *                     portion:
 *                       type: object
 *                       required:
 *                         - amount
 *                         - unit
 *                       properties:
 *                         amount:
 *                           type: number
 *                           description: Actual amount consumed
 *                           example: 45
 *                         unit:
 *                           type: string
 *                           enum: ["g", "kg", "ml", "l", "cup", "tbsp", "tsp", "oz", "lb"]
 *                           description: Unit of measurement
 *                           example: "g"
 *               notes:
 *                 type: string
 *                 description: Additional notes about the meal (optional)
 *                 example: "Added extra protein powder"
 *               isCompleted:
 *                 type: boolean
 *                 description: Whether the meal was completed
 *                 example: true
 *               actualStartDate:
 *                 oneOf:
 *                   - type: string
 *                     format: date
 *                   - type: string
 *                     format: date-time
 *                 description: Actual start time of the meal (accepts date or datetime)
 *                 example: "2024-01-15"
 *               actualEndDate:
 *                 oneOf:
 *                   - type: string
 *                     format: date
 *                   - type: string
 *                     format: date-time
 *                 description: Actual end time of the meal (accepts date or datetime)
 *                 example: "2024-01-15"
 *     responses:
 *       201:
 *         description: Meal log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Generated meal log ID
 *                   example: "507f1f77bcf86cd799439013"
 *                 versionId:
 *                   type: number
 *                   description: Version of the meal
 *                   example: 1
 *                 userId:
 *                   type: string
 *                   description: User ID who logged the meal
 *                   example: "507f1f77bcf86cd799439011"
 *                 mealId:
 *                   type: string
 *                   description: Meal ID that was logged
 *                   example: "507f1f77bcf86cd799439012"
 *                 mealSnapshot:
 *                   type: object
 *                   description: Snapshot of the meal
 *                 actualMacros:
 *                   type: object
 *                   description: Actual macros consumed
 *                 actualIngredients:
 *                   type: array
 *                   description: Actual ingredients consumed
 *                 notes:
 *                   type: string
 *                   description: Additional notes
 *                 isCompleted:
 *                   type: boolean
 *                   description: Completion status
 *                 actualStartDate:
 *                   type: string
 *                   format: date-time
 *                   description: Actual start time
 *                 actualEndDate:
 *                   type: string
 *                   format: date-time
 *                   description: Actual end time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last update timestamp
 *       400:
 *         description: Bad request - invalid meal log data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - user is not authorized to access this program
 *       404:
 *         description: Program or week not found
 *       500:
 *         description: Internal server error
 */
router.post(
  "/:programId/week/:weekId/meal/log",
  authMiddleware.authenticateToken,
  // programMiddleware.checkMemberOrAdminAuthorization,
  ProgramMiddleware.validateMealLogRequest,
  programController.addMealLog
);

/**
 * @swagger
 * /program/{programId}/weeks/{weekId}/workouts:
 *   get:
 *     tags: [Programs]
 *     summary: Get all workouts for a week
 *     description: Retrieves all workouts for a specific week within a program. Only program administrators or members can access this resource.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *         description: Week ID
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Week workouts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "507f1f77bcf86cd799439013"
 *                   name:
 *                     type: string
 *                     example: "Upper Body Strength"
 *                   description:
 *                     type: string
 *                     example: "Focus on upper body muscle groups"
 *                   category:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["strength", "upper-body"]
 *                   difficulty:
 *                     type: string
 *                     example: "intermediate"
 *                   duration:
 *                     type: number
 *                     example: 60
 *                   blocks:
 *                     type: array
 *                     description: Workout blocks/exercises
 *                     items:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           enum: ["single", "superset", "circuit"]
 *                         name:
 *                           type: string
 *                           example: "Main Strength Block"
 *                         exercises:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               exerciseId:
 *                                 type: string
 *                                 example: "bench-press"
 *                               targetSets:
 *                                 type: number
 *                                 example: 3
 *                               targetReps:
 *                                 type: number
 *                                 example: 10
 *                               targetWeight:
 *                                 type: number
 *                                 example: 135
 *                         order:
 *                           type: number
 *                           example: 1
 *                   accessType:
 *                     type: string
 *                     example: "0"
 *                   createdBy:
 *                     type: string
 *                     example: "507f1f77bcf86cd799439011"
 *                   startDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T09:00:00Z"
 *                   endDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:00:00Z"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not a program administrator or member
 *       404:
 *         description: Week not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:programId/week/:weekId/workouts",
  authMiddleware.authenticateToken,
  // programMiddleware.checkMemberOrAdminAuthorization,
  programController.getWeekWorkouts
);

/**
 * @swagger
 * /program/{programId}/weeks/{weekId}/meals:
 *   get:
 *     tags: [Programs]
 *     summary: Get all meals for a week
 *     description: Retrieves all meals for a specific week within a program. Only program administrators or members can access this resource.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *         description: Week ID
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Week meals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "507f1f77bcf86cd799439013"
 *                   mealName:
 *                     type: string
 *                     example: "Grilled Chicken Breast"
 *                   macros:
 *                     type: object
 *                     properties:
 *                       protein:
 *                         type: number
 *                         example: 30
 *                       carbs:
 *                         type: number
 *                         example: 5
 *                       fats:
 *                         type: number
 *                         example: 8
 *                   ingredients:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Chicken Breast"
 *                         portion:
 *                           type: object
 *                           properties:
 *                             amount:
 *                               type: number
 *                               example: 200
 *                             unit:
 *                               type: string
 *                               example: "g"
 *                   instructions:
 *                     type: string
 *                     example: "Season chicken with salt and pepper, grill for 6-7 minutes per side"
 *                   startDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T12:00:00Z"
 *                   endDate:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T13:00:00Z"
 *                   createdBy:
 *                     type: string
 *                     example: "507f1f77bcf86cd799439011"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not a program administrator or member
 *       404:
 *         description: Week not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:programId/week/:weekId/meals",
  authMiddleware.authenticateToken,
  // programMiddleware.checkMemberOrAdminAuthorization,
  programController.getWeekMeals
);

/**
 * @swagger
 * /program/{programId}/week/{weekId}:
 *   get:
 *     tags: [Programs]
 *     summary: Get a specific week
 *     description: Retrieves a specific week within a program. Only program administrators or members can access this resource.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: weekId
 *         required: true
 *         schema:
 *           type: string
 *         description: Week ID
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Week retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439012"
 *                 name:
 *                   type: string
 *                   example: "Week 1 - Foundation"
 *                 description:
 *                   type: string
 *                   example: "Building strength and endurance"
 *                 weekNumber:
 *                   type: number
 *                   example: 1
 *                 workouts:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of workout ObjectId strings
 *                   example: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
 *                 meals:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of meal ObjectId strings
 *                   example: ["507f1f77bcf86cd799439015", "507f1f77bcf86cd799439016"]
 *                 notes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Array of note ObjectId strings
 *                   example: ["507f1f77bcf86cd799439017", "507f1f77bcf86cd799439018"]
 *                 startDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-15"
 *                 endDate:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-21"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not a program administrator or member
 *       404:
 *         description: Week not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:programId/week/:weekId",
  authMiddleware.authenticateToken,
  // programMiddleware.checkMemberOrAdminAuthorization,
  programController.getWeek
);

export default router;
