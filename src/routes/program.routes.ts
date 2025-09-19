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
  new MealRepository(MealModel)
);

const programController = new ProgramController(programService);

const programMiddleware = new ProgramMiddleware(
  new ProgramRepository(ProgramModel)
);

/**
 * @swagger
 * /programs:
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
 *                 type: string
 *                 enum: [0, 1]
 *                 description: Program access type (0=Public, 1=Private)
 *                 example: 0
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
 *                   type: string
 *                   example: "0"
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

/**
 * @swagger
 * /programs/user/{userId}:
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
 *                     type: string
 *                     example: "0"
 *                   createdBy:
 *                     type: string
 *                     example: "507f1f77bcf86cd799439011"
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
 * /programs/{programId}/workouts:
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - blocks
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
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: ["single", "superset", "circuit"]
 *                     name:
 *                       type: string
 *                       example: "Main Strength Block"
 *                     exercises:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           exerciseId:
 *                             type: string
 *                             example: "bench-press"
 *                           targetSets:
 *                             type: number
 *                             example: 3
 *                           targetReps:
 *                             type: number
 *                             example: 10
 *                           targetWeight:
 *                             type: number
 *                             example: 135
 *                     order:
 *                       type: number
 *                       example: 1
 *               accessType:
 *                 type: string
 *                 enum: ["0", "1"]
 *                 description: Access type (0=Public, 1=Private)
 *                 example: "0"
 *               createdBy:
 *                 type: string
 *                 description: Creator user ID
 *                 example: "507f1f77bcf86cd799439011"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Workout start date
 *                 example: "2024-01-15T09:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Workout end date
 *                 example: "2024-01-15T10:00:00Z"
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
 *                   type: string
 *                   example: "0"
 *                 createdBy:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 startDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T09:00:00Z"
 *                 endDate:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:00:00Z"
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
  ProgramMiddleware.validateCreateWorkout,
  programController.createWorkout
);

router.post(
  "/:programId/week/:weekId/meal",
  authMiddleware.authenticateToken,
  programMiddleware.checkAdminAuthorization,
  ProgramMiddleware.validateMealRequest,
  programController.createMeal
);

/**
 * @swagger
 * /programs/{programId}/weeks/{weekId}/workouts:
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
  programMiddleware.checkMemberOrAdminAuthorization,
  programController.getWeekWorkouts
);

/**
 * @swagger
 * /programs/{programId}/weeks/{weekId}/meals:
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
  programMiddleware.checkMemberOrAdminAuthorization,
  programController.getWeekMeals
);

export default router;
