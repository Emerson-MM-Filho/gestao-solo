import { useTranslation } from "react-i18next";
import { IconAlertTriangle } from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LowStockItem } from "@/lib/types/report";

interface LowStockCardProps {
  items: LowStockItem[];
  isLoading?: boolean;
}

export function LowStockCard({ items, isLoading }: LowStockCardProps) {
  const { t } = useTranslation("reports");

  const criticalItems = items.filter((item) => item.status === "critical");
  const lowItems = items.filter((item) => item.status === "low");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("lowStock.title")}</CardTitle>
          <CardDescription>{t("lowStock.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("lowStock.title")}</CardTitle>
          <CardDescription>{t("lowStock.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <IconAlertTriangle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-medium">{t("lowStock.allGood")}</p>
            <p className="text-xs text-muted-foreground">
              {t("lowStock.noItemsNeedRestock")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t("lowStock.title")}
          <Badge variant="destructive">{items.length}</Badge>
        </CardTitle>
        <CardDescription>{t("lowStock.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Critical Items First */}
          {criticalItems.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-destructive">
                {t("lowStock.critical")} ({criticalItems.length})
              </p>
              <div className="space-y-2">
                {criticalItems.map((item) => (
                  <div
                    key={item.item_id}
                    className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-3"
                  >
                    <div>
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("lowStock.threshold")}:{" "}
                        {item.critical_threshold.toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-destructive">
                        {item.stock_quantity.toLocaleString("pt-BR", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <Badge variant="destructive" className="text-xs">
                        {t("lowStock.statusCritical")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Items */}
          {lowItems.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                {t("lowStock.low")} ({lowItems.length})
              </p>
              <div className="space-y-2">
                {lowItems.map((item) => (
                  <div
                    key={item.item_id}
                    className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900/50 dark:bg-orange-900/10"
                  >
                    <div>
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("lowStock.threshold")}:{" "}
                        {item.low_threshold.toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {item.stock_quantity.toLocaleString("pt-BR", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <Badge
                        variant="outline"
                        className="border-orange-600 text-xs text-orange-600 dark:border-orange-400 dark:text-orange-400"
                      >
                        {t("lowStock.statusLow")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
