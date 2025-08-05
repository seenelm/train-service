import { Router } from "express";
import SearchController from "../app/search/SearchController.js";
import SearchService from "../app/search/SearchService.js";
import SearchMiddleware from "../app/search/SearchMiddleware.js";
import CertificationRepository from "../infrastructure/database/repositories/userProfile/CertificationRepository.js";
import { CertificationModel } from "../infrastructure/database/models/userProfile/certificationModel.js";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware.js";
import UserRepository from "../infrastructure/database/repositories/user/UserRepository.js";
import { UserModel } from "../infrastructure/database/models/user/userModel.js";

const router = Router();

const authMiddleware = new AuthMiddleware(new UserRepository(UserModel));

const searchController = new SearchController(
  new SearchService(new CertificationRepository(CertificationModel))
);

router.get(
  "/certifications",
  authMiddleware.authenticateToken,
  SearchMiddleware.validateSearchCertifications,
  searchController.searchCertifications
);

export default router;
