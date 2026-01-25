import {
  IconCalendar,
  IconClock,
  IconMail,
  IconPhone,
  IconUser,
} from "@tabler/icons-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useAuth } from "@/components/auth-provider"
import { PhoneInputLazy as PhoneInput } from "@/components/phone-input-lazy"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { validateDisplayName, validatePhone, getAuthErrorMessage } from "@/lib/auth-utils"

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(dateString: string | undefined, locale: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const { user, updateProfile } = useAuth();
  const { t, i18n } = useTranslation(["account", "common"]);

  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!user) return null;

  // Generate avatar fallback from display name (first two letters)
  const displayName = user.user_metadata?.display_name || user.email || "";
  const avatarFallback = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const phone = user.user_metadata?.phone;

  const handleEditClick = () => {
    setEditDisplayName(displayName);
    setEditPhone(phone || "");
    setError("");
    setSuccessMessage("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const displayNameError = validateDisplayName(editDisplayName);
    if (displayNameError) {
      setError(displayNameError);
      return;
    }

    const phoneError = validatePhone(editPhone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setLoading(true);

    try {
      await updateProfile(editDisplayName, editPhone);
      setSuccessMessage(t("account:dialog.messages.updateSuccess"));
      setIsEditing(false);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("account:dialog.editTitle") : t("account:dialog.title")}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t("account:dialog.editDescription") : t("account:dialog.description")}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6 py-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
                  {successMessage}
                </div>
              )}

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="displayName">
                    {t("account:dialog.fields.displayName")}
                  </FieldLabel>
                  <Input
                    id="displayName"
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    disabled={loading}
                    required
                    autoFocus
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone">
                    {t("account:dialog.fields.phone")}
                  </FieldLabel>
                  <PhoneInput
                    id="phone"
                    value={editPhone}
                    onChange={(value) => setEditPhone(value || "")}
                    disabled={loading}
                    defaultCountry={i18n.language === "pt" ? "BR" : "US"}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">
                    {t("account:dialog.fields.email")}
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    readOnly
                    className="bg-muted"
                  />
                </Field>
              </FieldGroup>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                {t("account:dialog.actions.cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t("account:dialog.actions.saving") : t("account:dialog.actions.save")}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <div className="flex flex-col gap-6 py-4">
              {successMessage && (
                <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
                  {successMessage}
                </div>
              )}

              {/* Avatar Section */}
              <div className="flex justify-center">
                <Avatar className="h-24 w-24 rounded-lg">
                  <AvatarImage src="" alt={displayName} />
                  <AvatarFallback className="rounded-lg text-2xl">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Information Grid */}
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                {/* Display Name */}
                <div className="flex items-start gap-3">
                  <IconUser className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">
                      {t("account:dialog.fields.displayName")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {displayName}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <IconMail className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">
                      {t("account:dialog.fields.email")}
                    </span>
                    <span className="text-sm text-muted-foreground break-all">
                      {user.email}
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3">
                  <IconPhone className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">
                      {t("account:dialog.fields.phone")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {phone || t("account:dialog.fields.phoneNotProvided")}
                    </span>
                  </div>
                </div>

                {/* Account Created */}
                <div className="flex items-start gap-3">
                  <IconCalendar className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">
                      {t("account:dialog.fields.accountCreated")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(user.created_at, i18n.language)}
                    </span>
                  </div>
                </div>

                {/* Last Login */}
                <div className="flex items-start gap-3 sm:col-span-2">
                  <IconClock className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">
                      {t("account:dialog.fields.lastLogin")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(user.last_sign_in_at, i18n.language)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleEditClick} className="w-full sm:w-auto">
                {t("account:dialog.actions.edit")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
