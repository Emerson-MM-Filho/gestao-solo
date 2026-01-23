import { useAuth } from "@/components/auth-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { ModeToggle } from "@/components/theme-mode-toggle";
import { Button } from "@/components/ui/button";
import { Icon3dCubeSphere } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuth();
  const { t } = useTranslation(["landing", "common"]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with theme and language toggle */}
      <header className="absolute top-4 right-4 flex gap-2">
        <LanguageToggle />
        <ModeToggle />
      </header>

      {/* Hero Section - Centered, full viewport */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="size-16 flex items-center justify-center">
              <Icon3dCubeSphere className="size-16" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              {t("landing:title")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("landing:subtitle")}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Button size="lg" asChild>
                  <Link to="/auth/signup">{t("common:buttons.getStarted")}</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/auth/signin">{t("common:buttons.signIn")}</Link>
                </Button>
              </>
            ) : (
              <Button size="lg" asChild>
                <Link to="/dashboard">{t("common:buttons.goToDashboard")}</Link>
              </Button>
            )}
          </div>

          {/* Optional status badge */}
          {user && (
            <p className="text-sm text-muted-foreground">
              {t("landing:signedInAs")} {user.email}
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-6">
          <a href="#" className="hover:text-foreground transition-colors">
            {t("common:footer.termsOfService")}
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            {t("common:footer.privacyPolicy")}
          </a>
        </div>
        <p className="mt-2">{t("common:footer.copyright")}</p>
      </footer>
    </div>
  );
}
