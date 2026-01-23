import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/_authenticated/stock")({
  component: StockComponent,
});

function StockComponent() {
  const { t } = useTranslation(["common"]);

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t("common:navigation.stock")}</h1>

        <div className="rounded-lg border p-6">
          <p className="text-muted-foreground">
            Coming soon - Stock and inventory management functionality
          </p>
        </div>
      </div>
    </div>
  );
}
