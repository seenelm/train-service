import { Router } from "express";
import UserService from "../app/user/UserService.js";
import UserRepository from "../infrastructure/database/repositories/user/UserRepository.js";
import UserProfileRepository from "../infrastructure/database/repositories/user/UserProfileRepository.js";
import UserGroupsRepository from "../infrastructure/database/repositories/user/UserGroupsRepository.js";
import FollowRepository from "../infrastructure/database/repositories/user/FollowRepository.js";
import { UserModel } from "../infrastructure/database/models/user/userModel.js";
import { UserProfileModel } from "../infrastructure/database/models/userProfile/userProfileModel.js";
import { UserGroupsModel } from "../infrastructure/database/models/user/userGroupsModel.js";
import { FollowModel } from "../infrastructure/database/models/user/followModel.js";
import UserController from "../app/user/UserController.js";
import { verifyFirebaseToken } from "../common/middleware/verifyFirebaseToken.js";
import UserMiddleware from "../app/user/UserMiddleware.js";
import PasswordResetRepository from "../infrastructure/database/repositories/user/PasswordResetRepository.js";
import { PasswordResetModel } from "../infrastructure/database/models/user/passwordResetModel.js";
import EmailService from "../infrastructure/EmailService.js";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication
 */

const router = Router();

const userMiddleware = new UserMiddleware();
const authMiddleware = new AuthMiddleware(new UserRepository(UserModel));

const userService = new UserService(
  new UserRepository(UserModel),
  new UserProfileRepository(UserProfileModel),
  new UserGroupsRepository(UserGroupsModel),
  new FollowRepository(FollowModel),
  new PasswordResetRepository(PasswordResetModel),
  new EmailService()
);

const userController = new UserController(userService);

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRequest'
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/register",
  userMiddleware.validateRegisterUser,
  userController.register
);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLoginRequest'
 *     responses:
 *       200:
 *         description: User successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", userMiddleware.validateLoginUser, userController.login);

/**
 * @swagger
 * /user/google-auth:
 *   post:
 *     summary: Authenticate user with Google
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleAuthRequest'
 *     responses:
 *       200:
 *         description: User successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid Firebase token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/google-auth",
  userMiddleware.validateGoogleAuth,
  verifyFirebaseToken,
  userController.googleAuth
);

/**
 * @swagger
 * /user/request-password-reset:
 *   post:
 *     summary: Request a password reset
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestPasswordResetRequest'
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password reset email sent
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/request-password-reset",
  userMiddleware.validatePasswordReset,
  userController.requestPasswordReset
);

/**
 * @swagger
 * /user/reset-password-with-code:
 *   post:
 *     summary: Reset password using a reset code
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordWithCodeRequest'
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *       400:
 *         description: Invalid input data or reset code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found or reset code expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/reset-password-with-code",
  userMiddleware.validatePasswordResetWithCode,
  userController.resetPasswordWithCode
);

/**
 * @swagger
 * /user/refresh:
 *   post:
 *     summary: Refresh access and refresh tokens
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshTokenResponse'
 *       400:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - refresh token expired or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/refresh",
  userMiddleware.validateRefreshToken,
  userController.refreshTokens
);

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutRequest'
 *     responses:
 *       200:
 *         description: User successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       400:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/logout", authMiddleware.authenticateToken, userController.logout);

/**
 * @swagger
 * /user/expire-refresh-token:
 *   post:
 *     summary: Expire a refresh token (test mode only)
 *     tags: [Users]
 *     description: This endpoint is only available in test mode
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Refresh token expired successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Refresh token expired
 *       400:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Only available in test mode
router.post(
  "/expire-refresh-token",
  userMiddleware.validateRefreshToken,
  userController.expireRefreshToken
);

/**
 * @swagger
 * /user/reset-code/{userId}:
 *   get:
 *     summary: Get reset code for a user (test mode only)
 *     tags: [Users]
 *     description: This endpoint is only available in test mode
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Reset code retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resetCode:
 *                   type: string
 *                   example: "123456"
 *       404:
 *         description: User not found or no reset code available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Only available in test mode
router.get("/reset-code/:userId", userController.getResetCode);

export default router;
