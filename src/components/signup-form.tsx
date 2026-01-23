import { Icon3dCubeSphere } from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useAuth } from "@/components/auth-provider"
import { PhoneInput } from "@/components/phone-input"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  getAuthErrorMessage,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validatePhone,
} from "@/lib/auth-utils"
import { cn } from "@/lib/utils"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { t, i18n } = useTranslation(["auth", "common", "errors"]);

  // Set default country based on locale
  const defaultCountry = i18n.language === "pt" ? "BR" : "US";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Client-side validation
    const displayNameError = validateDisplayName(displayName);
    if (displayNameError) {
      setError(displayNameError);
      return;
    }

    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError(t("errors:validation.passwordsDoNotMatch"));
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, displayName, phone);
      setSuccess(true);
      setDisplayName("");
      setPhone("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <Icon3dCubeSphere className="size-6" />
              </div>
              <span className="sr-only">{t("common:appName")}</span>
            </a>
            <h1 className="text-xl font-bold">{t("auth:signup.title")}</h1>
            <FieldDescription>
              {t("auth:signup.subtitle")}{" "}
              <Link to="/auth/signin">{t("common:buttons.signIn")}</Link>
            </FieldDescription>
          </div>
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
              {t("auth:signup.success")}
            </div>
          )}
          <Field>
            <FieldLabel htmlFor="displayName">
              {t("common:labels.displayName")}
            </FieldLabel>
            <Input
              id="displayName"
              type="text"
              placeholder={t("common:placeholders.displayName")}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">{t("common:labels.phone")}</FieldLabel>
            <PhoneInput
              id="phone"
              value={phone}
              onChange={(value) => setPhone(value || "")}
              disabled={loading}
              defaultCountry={defaultCountry}
              placeholder={t("common:placeholders.phone")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">{t("common:labels.email")}</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder={t("common:placeholders.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">
              {t("common:labels.password")}
            </FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder={t("common:placeholders.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              minLength={6}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">
              {t("common:labels.confirmPassword")}
            </FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t("common:placeholders.password")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              minLength={6}
              required
            />
          </Field>
          <Field>
            <Button type="submit" disabled={loading}>
              {loading ? t("auth:signup.loading") : t("auth:signup.button")}
            </Button>
          </Field>
          {/* <FieldSeparator>Or</FieldSeparator> */}
          {/* <Field className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              Continue with Apple
            </Button>
            <Button variant="outline" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </Field> */}
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        {t("auth:agreement", {
          terms: t("auth:terms"),
          privacy: t("auth:privacy"),
        })}
      </FieldDescription>
    </div>
  );
}
