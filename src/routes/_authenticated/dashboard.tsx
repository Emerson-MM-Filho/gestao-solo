import { useAuth } from "@/components/auth-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { ModeToggle } from "@/components/theme-mode-toggle";
import { Button } from "@/components/ui/button";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardComponent,
});

function DashboardComponent() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(["dashboard", "common"]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate({ to: "/" });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t("dashboard:title")}</h1>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <ModeToggle />
            <Button onClick={handleSignOut} variant="outline">
              {t("common:buttons.signOut")}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-xl font-semibold">{t("dashboard:welcome")}</h2>
          <p className="mb-2 text-muted-foreground">
            {t("dashboard:signedInAs")}{" "}
            <span className="font-medium text-foreground">{user?.email}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {t("dashboard:userId")} {user?.id}
          </p>
        </div>

        <div className="mt-6">
          <Link to="/" className="text-primary hover:underline">
            ← {t("common:buttons.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
