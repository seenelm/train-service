import { RuleSet } from "../../common/utils/requestValidation.js";
import { ValidateRegisterUser, ValidateLoginUser } from "../../common/enums.js";

export default class UserRequestRules {
  public static registerRules: RuleSet<any> = {
    email: {
      hasError: (u) => !!u.email,
      message: ValidateRegisterUser.EmailRequired,
    },
    password: {
      hasError: (u) => !!u.password,
      message: ValidateRegisterUser.PasswordRequired,
    },
    name: {
      hasError: (u) => !!u.name,
      message: ValidateRegisterUser.NameRequired,
    },
  };

  // TODO: Add rules for password and email
  public static loginRules: RuleSet<any> = {
    email: {
      hasError: (u) => !!u.email,
      message: ValidateLoginUser.EmailRequired,
    },
    password: {
      hasError: (u) => !!u.password,
      message: ValidateLoginUser.PasswordRequired,
    },
  };
}
