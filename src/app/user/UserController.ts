import { NextFunction, Request, Response } from "express";
import UserService from "./UserService.js";
import {
  UserLoginRequest,
  UserResponse,
  GoogleAuthRequest,
} from "./dto/userDto.js";
import UserRequest from "./dto/UserRequest.js";

export default class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRequest: UserRequest = req.body;

      const userResponse: UserResponse = await this.userService.registerUser(
        userRequest
      );

      return res.status(201).json(userResponse);
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
      return res.status(201).json(userResponse);
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
      return res.status(200).json(userResponse);
    } catch (error) {
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
