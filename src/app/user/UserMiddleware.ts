import { Request, Response, NextFunction } from "express";
import { UserRequest, UserLoginRequest } from "./userDto.js";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { CreateValidator } from "../../common/utils/requestValidation.js";
import UserRequestRules from "./UserRequestRules.js";

export default class UserMiddleware {
  constructor() {}

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
      return res.status(HttpStatusCode.BAD_REQUEST).json(errors);
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
      return res.status(HttpStatusCode.BAD_REQUEST).json(errors);
    }
    next();
  };
}
