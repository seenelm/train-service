import { DecodedIdToken } from "firebase-admin/auth";
import { SearchQuery } from "../../app/search/SearchSchema.js";
import User from "../../infrastructure/database/entity/user/User.ts";
import Group from "../../infrastructure/database/entity/group/Group.ts";
import Program from "../../infrastructure/database/entity/program/Program.ts";

declare global {
  namespace Express {
    interface Request {
      user: User;
      group: Group;
      firebaseUser: DecodedIdToken;
      validatedQuery?: SearchQuery;
      program?: Program;
    }
  }
}

export {};
