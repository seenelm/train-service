import { Router } from "express";
import SearchController from "../app/search/SearchController.js";
import SearchService from "../app/search/SearchService.js";
import SearchMiddleware from "../app/search/SearchMiddleware.js";
import CertificationRepository from "../infrastructure/database/repositories/userProfile/CertificationRepository.js";
import SearchRepository from "../infrastructure/database/repositories/search/SearchRepository.js";
import UserProfileRepository from "../infrastructure/database/repositories/user/UserProfileRepository.js";
import GroupRepository from "../infrastructure/database/repositories/group/GroupRepository.js";
import { CertificationModel } from "../infrastructure/database/models/userProfile/certificationModel.js";
import { UserProfileModel } from "../infrastructure/database/models/userProfile/userProfileModel.js";
import { GroupModel } from "../infrastructure/database/models/group/groupModel.js";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware.js";
import UserRepository from "../infrastructure/database/repositories/user/UserRepository.js";
import { UserModel } from "../infrastructure/database/models/user/userModel.js";

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Search operations for certifications, profiles, and groups
 */

const router = Router();

const authMiddleware = new AuthMiddleware(new UserRepository(UserModel));

const searchController = new SearchController(
  new SearchService(
    new CertificationRepository(CertificationModel),
    new SearchRepository(
      new UserProfileRepository(UserProfileModel),
      new GroupRepository(GroupModel)
    ),
    new UserProfileRepository(UserProfileModel),
    new GroupRepository(GroupModel)
  )
);

/**
 * @swagger
 * /search/certifications:
 *   get:
 *     summary: Search for certifications
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search term string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Certifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchCertificationsResponse'
 *       400:
 *         description: Invalid input parameters
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/certifications",
  authMiddleware.authenticateToken,
  SearchMiddleware.validateSearchCertifications,
  searchController.searchCertifications
);

/**
 * @swagger
 * /search/profiles:
 *   get:
 *     summary: Search for user profiles and groups
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search term string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Profiles and groups retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchProfilesResponse'
 *       400:
 *         description: Invalid input parameters
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/profiles",
  authMiddleware.authenticateToken,
  SearchMiddleware.validateSearchProfiles,
  searchController.searchProfiles
);

export default router;
