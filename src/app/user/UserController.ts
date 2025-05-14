import { NextFunction, Request, Response } from "express";
import { IUserService } from "./UserService.js";
import {
  UserLoginRequest,
  UserResponse,
  GoogleAuthRequest,
  UserRequest,
} from "./userDto.js";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { Logger } from "../../common/logger.js";

export default class UserController {
  private userService: IUserService;
  private logger: Logger;

  constructor(userService: IUserService) {
    this.userService = userService;
    this.logger = Logger.getInstance();
  }

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRegisterRequest: UserRequest = req.body;
      this.logger.info("User registration request: ", userRegisterRequest);

      const userResponse: UserResponse = await this.userService.registerUser(
        userRegisterRequest
      );

      return res.status(HttpStatusCode.CREATED).json(userResponse);
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userLoginRequest: UserLoginRequest = req.body;

      const userResponse: UserResponse = await this.userService.loginUser(
        userLoginRequest
      );
      return res.status(HttpStatusCode.OK).json(userResponse);
    } catch (error) {
      next(error);
    }
  };

  public googleAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const googleAuthRequest = req.body as GoogleAuthRequest;
      const decodedToken = req.firebaseUser;

      const userResponse = await this.userService.authenticateWithGoogle(
        decodedToken,
        googleAuthRequest
      );
      return res.status(HttpStatusCode.OK).json(userResponse);
    } catch (error) {
      next(error);
    }
  };

  public refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { refreshToken, deviceId } = req.body;

      const userResponse = await this.userService.refreshToken(
        refreshToken,
        deviceId
      );

      return res.status(HttpStatusCode.OK).json(userResponse);
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken, deviceId } = req.body;

      await this.userService.logoutUser(refreshToken, deviceId);

      return res.status(HttpStatusCode.NO_CONTENT).json({
        message: "User logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
