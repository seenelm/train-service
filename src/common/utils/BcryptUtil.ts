import { AuthError } from "../errors/AuthError.js";
import { Logger } from "../logger.js";
import bcrypt from "bcryptjs";

export default class BcryptUtil {
  private static logger: Logger = Logger.getInstance();

  public static async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 12);
    } catch (error) {
      throw AuthError.HashingFailed(error);
    }
  }

  public static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      this.logger.error("Error comparing password", error);
      return false;
    }
  }
}
