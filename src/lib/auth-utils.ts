import i18n from "@/i18n";
import { AuthError } from "@supabase/supabase-js";

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthError) {
    switch (error.message) {
      case "Invalid login credentials":
        return i18n.t("errors:auth.invalidCredentials");
      case "Email not confirmed":
        return i18n.t("errors:auth.emailNotConfirmed");
      case "User already registered":
        return i18n.t("errors:auth.userAlreadyExists");
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return i18n.t("errors:auth.unexpectedError");
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) {
    return i18n.t("errors:validation.passwordTooShort");
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return i18n.t("errors:validation.invalidEmail");
  }
  return null;
}
