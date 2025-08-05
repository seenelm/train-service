import { DecodedIdToken } from "firebase-admin/auth";
import { SearchQuery } from "../../app/search/SearchSchema.js";
import User from "../../infrastructure/database/entity/user/User.ts";

declare global {
  namespace Express {
    interface Request {
      user: User;
      firebaseUser: DecodedIdToken;
      validatedQuery?: SearchQuery;
    }
  }
}

export {};
