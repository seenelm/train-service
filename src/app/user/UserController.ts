import { NextFunction, Request, Response } from "express";
import { IUserService } from "./UserService.js";
import {
  UserLoginRequest,
  UserResponse,
  GoogleAuthRequest,
  UserRequest,
  RefreshTokenRequest,
  LogoutRequest,
  RequestPasswordResetRequest,
  ResetPasswordWithCodeRequest,
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

  public requestPasswordReset = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const requestPasswordResetRequest =
        req.body as RequestPasswordResetRequest;

      await this.userService.requestPasswordReset(requestPasswordResetRequest);

      return res.status(HttpStatusCode.OK).json({
        message: "Password reset request sent successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public resetPasswordWithCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const resetPasswordWithCodeRequest =
        req.body as ResetPasswordWithCodeRequest;

      await this.userService.resetPasswordWithCode(
        resetPasswordWithCodeRequest
      );

      return res.status(HttpStatusCode.OK).json({
        message: "Password reset successful",
      });
    } catch (error) {
      next(error);
    }
  };

  public refreshTokens = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const refreshTokensRequest = req.body as RefreshTokenRequest;

      const userResponse = await this.userService.refreshTokens(
        refreshTokensRequest
      );

      return res.status(HttpStatusCode.OK).json(userResponse);
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logoutRequest = req.body as LogoutRequest;

      await this.userService.logoutUser(logoutRequest);

      return res.status(HttpStatusCode.OK).json({
        message: "User logged out successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}
