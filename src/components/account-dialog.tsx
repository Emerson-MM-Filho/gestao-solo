import {
  IconCalendar,
  IconClock,
  IconMail,
  IconPhone,
  IconUser,
} from "@tabler/icons-react"
import { useTranslation } from "react-i18next"

import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  const { user } = useAuth();
  const { t, i18n } = useTranslation(["account", "common"]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("account:dialog.title")}</DialogTitle>
          <DialogDescription>
            {t("account:dialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
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
      </DialogContent>
    </Dialog>
  );
}
