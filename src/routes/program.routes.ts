import { Router } from "express";
import ProgramService from "../app/programs/ProgramService.js";
import ProgramRepository from "../infrastructure/database/repositories/programs/ProgramRepository.js";
import { ProgramModel } from "../infrastructure/database/models/programs/programModel.js";
import ProgramController from "../app/programs/ProgramController.js";
import ProgramMiddleware from "../app/programs/ProgramMiddleware.js";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware.js";
import UserRepository from "../infrastructure/database/repositories/user/UserRepository.js";
import { UserModel } from "../infrastructure/database/models/user/userModel.js";

/**
 * @swagger
 * tags:
 *   name: Programs
 *   description: Program management
 */

const router = Router();

const authMiddleware = new AuthMiddleware(new UserRepository(UserModel));

const programService = new ProgramService(new ProgramRepository(ProgramModel));

const programController = new ProgramController(programService);

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

export default router;
