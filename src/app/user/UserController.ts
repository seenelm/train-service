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
} from "@seenelm/train-core";
import { StatusCodes as HttpStatusCode } from "http-status-codes";
import { Logger } from "../../common/logger.js";
import { AuthError } from "../../common/errors/AuthError.js";

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
      this.logger.info("User login request: ", userLoginRequest);

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
      this.logger.info("Refresh tokens request: ", refreshTokensRequest);

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
      const userId = req.user.getId();

      await this.userService.logoutUser(userId, logoutRequest);

      return res.status(HttpStatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  public expireRefreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const refreshTokenRequest = req.body as RefreshTokenRequest;

      await this.userService.expireRefreshToken(refreshTokenRequest);

      return res.status(HttpStatusCode.OK).json({
        message: "Refresh token expired successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  public getResetCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.params.userId;
      const resetCode = await this.userService.getResetCode(userId);

      return res.status(HttpStatusCode.OK).json({
        resetCode,
      });
    } catch (error) {
      next(error);
    }
  };
}
