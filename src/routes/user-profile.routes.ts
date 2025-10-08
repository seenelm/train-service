import { Router } from "express";
import UserProfileController from "../app/userProfile/UserProfileController.js";
import UserProfileService from "../app/userProfile/UserProfileService.js";
import UserProfileRepository from "../infrastructure/database/repositories/user/UserProfileRepository.js";
import UserRepository from "../infrastructure/database/repositories/user/UserRepository.js";
import FollowRepository from "../infrastructure/database/repositories/user/FollowRepository.js";
import UserGroupsRepository from "../infrastructure/database/repositories/user/UserGroupsRepository.js";
import { UserProfileModel } from "../infrastructure/database/models/userProfile/userProfileModel.js";
import { UserModel } from "../infrastructure/database/models/user/userModel.js";
import { FollowModel } from "../infrastructure/database/models/user/followModel.js";
import { UserGroupsModel } from "../infrastructure/database/models/user/userGroupsModel.js";
import UserProfileMiddleware from "../app/userProfile/UserProfileMiddleware.js";
import FollowMiddleware from "../app/userProfile/FollowMiddleware.js";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: UserProfiles
 *   description: User profile management and social connections
 */

const router = Router();

const authMiddleware = new AuthMiddleware(new UserRepository(UserModel));

const userProfileRepository = new UserProfileRepository(UserProfileModel);

const userProfileController = new UserProfileController(
  new UserProfileService(
    userProfileRepository,
    new FollowRepository(FollowModel),
    new UserGroupsRepository(UserGroupsModel)
  )
);

/**
 * @swagger
 * /user-profile:
 *   put:
 *     summary: Update a user profile
 *     description: Updates the user profile information for the authenticated user. All fields except userId, username, name, and accountType are optional.
 *     tags: [UserProfiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - username
 *               - name
 *               - accountType
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *                 example: "507f1f77bcf86cd799439011"
 *               username:
 *                 type: string
 *                 description: Username
 *                 example: "johndoe"
 *               name:
 *                 type: string
 *                 description: Full name
 *                 example: "John Doe"
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number
 *                 example: "+1234567890"
 *               birthday:
 *                 type: string
 *                 format: date-time
 *                 description: Date of birth
 *                 example: "1990-01-15T00:00:00.000Z"
 *               bio:
 *                 type: string
 *                 description: User biography
 *                 example: "Fitness enthusiast and personal trainer"
 *               accountType:
 *                 type: number
 *                 enum: [1, 2]
 *                 description: Account type (1=Public, 2=Private)
 *                 example: 1
 *               role:
 *                 type: string
 *                 description: User role or profession
 *                 example: "Personal Trainer"
 *               location:
 *                 type: string
 *                 description: User location
 *                 example: "New York, NY"
 *               socialLinks:
 *                 type: array
 *                 description: Social media links
 *                 items:
 *                   type: object
 *                   required:
 *                     - platform
 *                     - url
 *                   properties:
 *                     platform:
 *                       type: string
 *                       enum: ["instagram", "facebook", "twitter", "linkedin", "youtube", "tiktok", "website"]
 *                       description: Social media platform
 *                       example: "instagram"
 *                     url:
 *                       type: string
 *                       description: URL to social media profile
 *                       example: "https://instagram.com/johndoe"
 *               certifications:
 *                 type: array
 *                 description: Professional certifications
 *                 items:
 *                   type: object
 *                   required:
 *                     - certification
 *                     - specializations
 *                     - receivedDate
 *                   properties:
 *                     certification:
 *                       type: string
 *                       description: Certification name
 *                       example: "NASM-CPT"
 *                     specializations:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Areas of specialization
 *                       example: ["Strength Training", "Weight Loss"]
 *                     receivedDate:
 *                       type: string
 *                       description: Date certification was received
 *                       example: "2020-06-15"
 *               customSections:
 *                 type: array
 *                 description: Custom profile sections
 *                 items:
 *                   type: object
 *                   required:
 *                     - title
 *                     - details
 *                   properties:
 *                     title:
 *                       type: string
 *                       enum: ["achievements", "stats", "other"]
 *                       description: Section type
 *                       example: "achievements"
 *                     details:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Section details
 *                       example: ["Completed 100 workouts", "Lost 20 lbs"]
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                 username:
 *                   type: string
 *                   example: "johndoe"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 phoneNumber:
 *                   type: string
 *                   example: "+1234567890"
 *                 birthday:
 *                   type: string
 *                   format: date-time
 *                   example: "1990-01-15T00:00:00.000Z"
 *                 bio:
 *                   type: string
 *                   example: "Fitness enthusiast and personal trainer"
 *                 accountType:
 *                   type: number
 *                   example: 1
 *                 role:
 *                   type: string
 *                   example: "Personal Trainer"
 *                 location:
 *                   type: string
 *                   example: "New York, NY"
 *                 socialLinks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       platform:
 *                         type: string
 *                         example: "instagram"
 *                       url:
 *                         type: string
 *                         example: "https://instagram.com/johndoe"
 *                 certifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       certification:
 *                         type: string
 *                         example: "NASM-CPT"
 *                       specializations:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Strength Training", "Weight Loss"]
 *                       receivedDate:
 *                         type: string
 *                         example: "2020-06-15"
 *                 customSections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "achievements"
 *                       details:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Completed 100 workouts", "Lost 20 lbs"]
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User profile not found
 *       500:
 *         description: Server error
 */
router.put(
  "/",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateUserProfileRequest,
  userProfileController.updateUserProfile
);

/**
 * @swagger
 * /user-profile/{userId}:
 *   get:
 *     summary: Get a user profile by ID
 *     tags: [UserProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to get profile for
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User profile not found
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
router.get(
  "/:userId",
  authMiddleware.authenticateToken,
  userProfileController.getUserProfile
);

/**
 * @swagger
 * /user-profile/{userId}/custom-section:
 *   post:
 *     summary: Create a custom section in user profile
 *     tags: [UserProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomSection'
 *     responses:
 *       201:
 *         description: Custom section created successfully
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
 *                   example: Custom section created successfully
 *                 section:
 *                   $ref: '#/components/schemas/CustomSection'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User profile not found
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
  "/:userId/custom-section",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateCreateCustomSection,
  userProfileController.createCustomSection
);
/**
 * @swagger
 * /user-profile/{userId}/custom-sections:
 *   get:
 *     summary: Get all custom sections for a user profile
 *     tags: [UserProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Custom sections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customSections:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CustomSection'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User profile not found
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
router.get(
  "/:userId/custom-sections",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateGetCustomSections,
  userProfileController.getCustomSections
);
/**
 * @swagger
 * /user-profile/{userId}/custom-section/{sectionTitle}:
 *   delete:
 *     summary: Delete a custom section from user profile
 *     tags: [UserProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: path
 *         name: sectionTitle
 *         required: true
 *         schema:
 *           type: string
 *         description: Title of the section to delete
 *     responses:
 *       200:
 *         description: Custom section deleted successfully
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
 *                   example: Custom section deleted successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User profile or section not found
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
router.delete(
  "/:userId/custom-section/:sectionTitle",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateDeleteCustomSection,
  userProfileController.deleteCustomSection
);
/**
 * @swagger
 * /user-profile/{userId}/custom-section:
 *   patch:
 *     summary: Update a custom section in user profile
 *     tags: [UserProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomSection'
 *     responses:
 *       200:
 *         description: Custom section updated successfully
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
 *                   example: Custom section updated successfully
 *                 section:
 *                   $ref: '#/components/schemas/CustomSection'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User profile or section not found
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
router.patch(
  "/:userId/custom-section",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateUpdateCustomSection,
  userProfileController.updateCustomSection
);
/**
 * @swagger
 * /user-profile/{userId}/basic-info:
 *   patch:
 *     summary: Update basic user profile information
 *     tags: [UserProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BasicProfileUpdate'
 *     responses:
 *       200:
 *         description: Basic profile information updated successfully
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
 *                   example: Basic profile updated successfully
 *                 profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User profile not found
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
router.patch(
  "/:userId/basic-info",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateBasicProfileUpdate,
  userProfileController.updateBasicUserProfile
);
/**
 * @swagger
 * /user-profile/{followeeId}/follow:
 *   put:
 *     summary: Follow a user with public account
 *     tags: [UserProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: followeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to follow
 *     responses:
 *       200:
 *         description: Successfully followed user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FollowResponse'
 *       400:
 *         description: Invalid request or already following
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Cannot follow private account directly
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
router.put(
  "/:followeeId/follow",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateFollowUser,
  FollowMiddleware.checkAccountIsPublic,
  userProfileController.followUser
);

/**
 * @swagger
 * /user-profile/{followeeId}/follow-request:
 *   post:
 *     summary: Request to follow a user with private account
 *     tags: [UserProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: followeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to request to follow
 *     responses:
 *       200:
 *         description: Follow request sent successfully
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
 *                   example: Follow request sent successfully
 *                 requestId:
 *                   type: string
 *                   description: ID of the follow request
 *       400:
 *         description: Invalid request or request already sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Cannot request to follow public account
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
  "/:followeeId/follow-request",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateRequestToFollowUser,
  FollowMiddleware.checkAccountIsPrivate,
  userProfileController.requestToFollowUser
);

/**
 * @swagger
 * /user-profile/{followerId}/accept-follow-request:
 *   put:
 *     summary: Accept a follow request from another user
 *     tags: [UserProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: followerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user who sent the follow request
 *     responses:
 *       200:
 *         description: Follow request accepted successfully
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
 *                   example: Follow request accepted successfully
 *                 followId:
 *                   type: string
 *                   description: ID of the new follow relationship
 *       400:
 *         description: Invalid request or no pending request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User or follow request not found
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
router.put(
  "/:followerId/accept-follow-request",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateAcceptFollowRequest,
  userProfileController.acceptFollowRequest
);

/**
 * @swagger
 * /user-profile/{followerId}/reject-follow-request:
 *   delete:
 *     summary: Reject a follow request from another user
 *     tags: [UserProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: followerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user who sent the follow request
 *     responses:
 *       200:
 *         description: Follow request rejected successfully
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
 *                   example: Follow request rejected successfully
 *       400:
 *         description: Invalid request or no pending request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User or follow request not found
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
router.delete(
  "/:followerId/reject-follow-request",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateRejectFollowRequest,
  userProfileController.rejectFollowRequest
);

router.delete(
  "/:followeeId/unfollow",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateUnfollowUser,
  userProfileController.unfollowUser
);

router.delete(
  "/:followerId/remove-follower",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateRemoveFollower,
  userProfileController.removeFollower
);

router.get(
  "/:userId/groups",
  authMiddleware.authenticateToken,
  userProfileController.fetchUserGroups
);

// Cursor-based pagination routes for followers/following
router.get(
  "/:userId/follow-stats",
  authMiddleware.authenticateToken,
  userProfileController.getFollowStats
);

router.get(
  "/:userId/followers",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateCursorPagination,
  userProfileController.getFollowers
);

router.get(
  "/:userId/following",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateCursorPagination,
  userProfileController.getFollowing
);

router.get(
  "/:userId/followers/search",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateSearchWithCursor,
  userProfileController.searchFollowers
);

router.get(
  "/:userId/following/search",
  authMiddleware.authenticateToken,
  UserProfileMiddleware.validateSearchWithCursor,
  userProfileController.searchFollowing
);

export default router;
