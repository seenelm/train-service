import { Request, Response, NextFunction } from "express";
import { UserRequest, UserLoginRequest, GoogleAuthRequest } from "./userDto.js";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { CreateValidator } from "../../common/utils/requestValidation.js";
import UserRequestRules from "./UserRequestRules.js";
import { APIError } from "../../common/errors/APIError.js";
import { Logger } from "../../common/logger.js";

export default class UserMiddleware {
  private logger: Logger;
  constructor() {
    this.logger = Logger.getInstance();
  }

  validateRegisterUser = async (
    req: Request<{}, {}, UserRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const userRequest: UserRequest = req.body;

    const errors = CreateValidator.validate(
      userRequest,
      UserRequestRules.registerRules
    );

    if (errors && errors.length > 0) {
      return next(APIError.BadRequest("Validation failed", errors));
    }
    next();
  };

  validateLoginUser = async (
    req: Request<{}, {}, UserLoginRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const userLoginRequest: UserLoginRequest = req.body;

    const errors = CreateValidator.validate(
      userLoginRequest,
      UserRequestRules.loginRules
    );

    if (errors && errors.length > 0) {
      return next(APIError.BadRequest("Validation failed", errors));
    }
    next();
  };

  validateGoogleAuth = async (
    req: Request<{}, {}, GoogleAuthRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const googleAuthRequest: GoogleAuthRequest = req.body;

    const errors = CreateValidator.validate(
      googleAuthRequest,
      UserRequestRules.googleAuthRules
    );

    if (errors && errors.length > 0) {
      return next(APIError.BadRequest("Validation failed", errors));
    }
    next();
  };

  validateRefreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const errors = CreateValidator.validate(
      req.body,
      UserRequestRules.refreshTokenRules
    );

    if (errors && errors.length > 0) {
      return next(APIError.BadRequest("Validation failed", errors));
    }
    next();
  };

  validateLogout = async (req: Request, res: Response, next: NextFunction) => {
    const errors = CreateValidator.validate(
      req.body,
      UserRequestRules.logoutRules
    );

    if (errors && errors.length > 0) {
      return next(APIError.BadRequest("Validation failed", errors));
    }
    next();
  };
}
