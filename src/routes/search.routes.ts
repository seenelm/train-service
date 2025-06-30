import { Router } from "express";
import SearchController from "../app/search/SearchController.js";
import SearchService from "../app/search/SearchService.js";
import CertificationRepository from "../infrastructure/database/repositories/userProfile/CertificationRepository.js";
import { CertificationModel } from "../infrastructure/database/models/userProfile/certificationModel.js";

const router = Router();

const searchController = new SearchController(
  new SearchService(new CertificationRepository(CertificationModel))
);

router.get(
  "/certifications/:searchTerm",
  searchController.searchCertifications
);

export default router;
