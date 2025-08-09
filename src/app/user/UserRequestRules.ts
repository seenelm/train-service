import { RuleSet } from "../../common/utils/requestValidation.js";
import {
  ValidateRegisterUser,
  ValidateLoginUser,
  ValidateLogout,
  ValidateRefreshTokens,
  ValidateGoogleAuth,
  ValidatePasswordReset,
} from "../../common/enums.js";

export default class UserRequestRules {
  public static registerRules: RuleSet<any> = {
    email: {
      hasError: (u) => !u.email,
      message: ValidateRegisterUser.EmailRequired,
    },
    password: {
      hasError: (u) => !u.password,
      message: ValidateRegisterUser.PasswordRequired,
    },
    name: {
      hasError: (u) => !u.name,
      message: ValidateRegisterUser.NameRequired,
    },
    deviceId: {
      hasError: (u) => !u.deviceId,
      message: ValidateRegisterUser.DeviceIdRequired,
    },
  };

  // TODO: Add rules for password and email
  public static loginRules: RuleSet<any> = {
    email: {
      hasError: (u) => !u.email,
      message: ValidateLoginUser.EmailRequired,
    },
    password: {
      hasError: (u) => !u.password,
      message: ValidateLoginUser.PasswordRequired,
    },
    deviceId: {
      hasError: (u) => !u.deviceId,
      message: ValidateLoginUser.DeviceIdRequired,
    },
  };

  public static refreshTokenRules: RuleSet<any> = {
    refreshToken: {
      hasError: (u) => !u.refreshToken,
      message: ValidateRefreshTokens.RefreshTokenRequired,
    },
    deviceId: {
      hasError: (u) => !u.deviceId,
      message: ValidateRefreshTokens.DeviceIdRequired,
    },
  };

  public static logoutRules: RuleSet<any> = {
    refreshToken: {
      hasError: (u) => !u.refreshToken,
      message: ValidateLogout.RefreshTokenRequired,
    },
    deviceId: {
      hasError: (u) => !u.deviceId,
      message: ValidateLogout.DeviceIdRequired,
    },
  };

  public static googleAuthRules: RuleSet<any> = {
    deviceId: {
      hasError: (u) => !u.deviceId,
      message: ValidateGoogleAuth.DeviceIdRequired,
    },
  };

  public static passwordResetRules: RuleSet<any> = {
    email: {
      hasError: (u) => !u.email,
      message: ValidatePasswordReset.EmailRequired,
    },
  };

  public static resetPasswordWithCodeRules: RuleSet<any> = {
    email: {
      hasError: (u) => !u.email,
      message: ValidatePasswordReset.EmailRequired,
    },
    resetCode: {
      hasError: (u) => !u.resetCode,
      message: ValidatePasswordReset.ResetCodeRequired,
    },
    newPassword: {
      hasError: (u) => !u.newPassword,
      message: ValidatePasswordReset.NewPasswordRequired,
    },
  };
}
