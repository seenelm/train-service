import { DecodedIdToken } from "firebase-admin/auth";
import { SearchQuery } from "../../app/search/SearchSchema.js";

declare global {
  namespace Express {
    interface Request {
      user: any;
      firebaseUser: DecodedIdToken;
      validatedQuery?: SearchQuery;
    }
  }
}

export {};
