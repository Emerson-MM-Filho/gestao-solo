import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { LanguageToggle } from "@/components/language-toggle"
import { ModeToggle } from "@/components/theme-mode-toggle"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsComponent,
});

function SettingsComponent() {
  const { t } = useTranslation(["settings"]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">
          {t("settings:page.title")}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {t("settings:page.description")}
        </p>
      </div>

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings:sections.appearance.title")}</CardTitle>
          <CardDescription>
            {t("settings:sections.appearance.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Theme Setting */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label className="text-base">
                  {t("settings:settings.theme.label")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings:settings.theme.description")}
                </p>
              </div>
              <div className="flex-shrink-0">
                <ModeToggle showLabel/>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language & Region Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings:sections.language.title")}</CardTitle>
          <CardDescription>
            {t("settings:sections.language.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Language Setting */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <Label className="text-base">
                  {t("settings:settings.language.label")}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("settings:settings.language.description")}
                </p>
              </div>
              <div className="flex-shrink-0">
                <LanguageToggle showLabel />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
