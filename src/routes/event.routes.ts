import { Router } from "express";
import EventController from "../app/event/EventController.js";
import EventService from "../app/event/EventService.js";
import EventRepository from "../infrastructure/database/repositories/event/EventRepository.js";
import UserEventRepository from "../infrastructure/database/repositories/event/UserEventRepository.js";
import { Event } from "../infrastructure/database/models/events/eventModel.js";
import { UserEvent } from "../infrastructure/database/models/events/userEventModel.js";
import EventMiddleware from "../app/event/EventMiddleware.js";
import { AuthMiddleware } from "../common/middleware/AuthMiddleware.js";
import UserRepository from "../infrastructure/database/repositories/user/UserRepository.js";
import { UserModel } from "../infrastructure/database/models/user/userModel.js";

const router = Router();

const authMiddleware = new AuthMiddleware(new UserRepository(UserModel));

const eventController = new EventController(
  new EventService(
    new EventRepository(Event),
    new UserEventRepository(UserEvent)
  )
);

// Event routes
router.post(
  "/",
  authMiddleware.authenticateToken,
  EventMiddleware.validateCreateEvent,
  eventController.addEvent
);

router.get(
  "/user/:userId",
  authMiddleware.authenticateToken,
  eventController.getUserEvents
);

export default router;
