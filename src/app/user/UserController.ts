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

  googleAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body as GoogleAuthRequest;
      const decodedToken = req.firebaseUser;

      const userResponse = await this.userService.authenticateWithGoogle(
        decodedToken,
        name
      );
      return res.status(HttpStatusCode.OK).json(userResponse);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({ 
          message: "User ID is required" 
        });
      }
      
      this.logger.info("User deletion request for userId:", userId);
      
      await this.userService.deleteUser(userId);
      
      return res.status(HttpStatusCode.OK).json({ 
        success: true,
        message: "User deleted successfully" 
      });
    } catch (error) {
      this.logger.error("Error deleting user:", error);
      next(error);
    }
  };

  // findUserById = async (req: Request, res: Response, next: NextFunction) => {
  //     try {
  //         const { userId } = req.params;
  //         let id = new Types.ObjectId(userId);
  //         const user = await this.userService.findUserById(id);
  //         return res.status(201).json(user);
  //     } catch (error) {
  //         next(error);
  //     }
  // };

  // deleteUserAccount = async (
  //     req: Request,
  //     res: Response,
  //     next: NextFunction,
  // ) => {
  //     const { userId } = req.params;
  //     let userID = new Types.ObjectId(userId);

  //     try {
  //         await this.userService.deleteUserAccount(userID);
  //         return res.status(201).json({ success: true });
  //     } catch (error) {
  //         next(error);
  //     }
  // };
}
