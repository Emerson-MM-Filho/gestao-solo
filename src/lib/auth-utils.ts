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

export function validateDisplayName(displayName: string): string | null {
  if (displayName.trim().length === 0) {
    return i18n.t("errors:validation.displayNameRequired");
  }
  if (displayName.length > 50) {
    return i18n.t("errors:validation.displayNameTooLong");
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  // Allow empty since phone is optional
  if (phone.trim().length === 0) {
    return null;
  }

  // E.164 format: + followed by 1-15 digits
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    return i18n.t("errors:validation.phoneInvalid");
  }

  return null;
}
