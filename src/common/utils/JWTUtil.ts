import jwt, { SignOptions } from "jsonwebtoken";

class JWTUtil {
  public static sign(
    payload: object,
    secret: string,
    expiresIn?: number | string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const options: SignOptions = {};
      if (expiresIn) {
        options.expiresIn = expiresIn;
      }

      jwt.sign(payload, secret, options, (error, token) => {
        if (error || !token) {
          reject(error);
        } else {
          resolve(token);
        }
      });
    });
  }

  public static verify(token: string, secret: string): Promise<object> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (error, decoded) => {
        if (error) {
          reject(error);
        } else {
          resolve(decoded as object);
        }
      });
    });
  }
}

export default JWTUtil;
