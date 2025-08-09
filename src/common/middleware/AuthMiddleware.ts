import { NextFunction, Request, Response } from "express";
import { AuthError } from "../errors/AuthError.js";
import { Types } from "mongoose";
import JWTUtil from "../utils/JWTUtil.js";
import { IUserRepository } from "../../infrastructure/database/repositories/user/UserRepository.js";
import { APIError } from "../errors/APIError.js";
import pkg from "jsonwebtoken";
const { JsonWebTokenError, TokenExpiredError, NotBeforeError } = pkg;
import { Logger } from "../logger.js";
import admin from "../../infrastructure/firebase/firebaseConfig.js";

export interface TokenPayload {
  username: string;
  userId: Types.ObjectId;
}

export class AuthMiddleware {
  private userRepository: IUserRepository;
  private logger: Logger;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
    this.logger = Logger.getInstance();
  }

  private getAccessToken(authorization: string): string {
    let token: string;

    if (!authorization || authorization.trim() === "") {
      // Add logging
      throw AuthError.Unauthorized("Missing Authorization header");
    }

    let size = authorization.split(" ");

    if (
      size.length > 1 &&
      authorization &&
      authorization.startsWith("Bearer")
    ) {
      token = size[1];
    } else {
      // Add logging
      throw AuthError.Unauthorized("Invalid Authorization");
    }

    return token;
  }

  public authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.headers.authorization) {
      // Add logging
      return next(AuthError.Unauthorized("Missing Authorization header"));
    }
    const token = this.getAccessToken(req.headers.authorization);

    try {
      const secretKey = process.env.SECRET_CODE;
      if (!secretKey) {
        this.logger.error("SECRET_CODE environment variable is not defined");
        throw APIError.InternalServerError(
          "Authentication service configuration error"
        );
      }
      const decodedToken = await JWTUtil.verify(token, secretKey);
      const payload = decodedToken as TokenPayload;

      const user = await this.userRepository.findById(payload.userId);

      if (!user) {
        // Add logging
        throw APIError.NotFound("User is not found");
      }

      req.user = user;
      next();
    } catch (error) {
      if (
        error instanceof JsonWebTokenError ||
        error instanceof TokenExpiredError ||
        error instanceof NotBeforeError
      ) {
        throw AuthError.handleJWTError(error);
      }

      throw APIError.InternalServerError("Error authenticating token");
    }
  };

  public verifyFirebaseToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Token:", token);

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log("Decoded Token:", decodedToken);
      req.firebaseUser = decodedToken;
      next();
    } catch (error) {
      console.error("Error verifying token:", error);
      return res.status(403).json({ message: "Unauthorized" });
    }
  };
}
