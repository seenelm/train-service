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

router.get(
  "/certifications",
  authMiddleware.authenticateToken,
  SearchMiddleware.validateSearchCertifications,
  searchController.searchCertifications
);

router.get(
  "/profiles",
  authMiddleware.authenticateToken,
  SearchMiddleware.validateSearchProfiles,
  searchController.searchProfiles
);

export default router;
