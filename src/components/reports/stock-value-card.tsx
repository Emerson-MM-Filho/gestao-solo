import { useTranslation } from "react-i18next";
import { IconBox, IconPackage } from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StockValueSummary } from "@/lib/types/report";
import { formatCurrency } from "@/lib/report-utils";

interface StockValueCardProps {
  summary: StockValueSummary;
  isLoading?: boolean;
}

export function StockValueCard({ summary, isLoading }: StockValueCardProps) {
  const { t } = useTranslation("reports");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("stockValue.title")}</CardTitle>
          <CardDescription>{t("stockValue.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const merchandisePercentage =
    summary.total_value > 0
      ? (summary.merchandise_value / summary.total_value) * 100
      : 0;

  const supplyPercentage =
    summary.total_value > 0
      ? (summary.supply_value / summary.total_value) * 100
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("stockValue.title")}</CardTitle>
        <CardDescription>{t("stockValue.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Value */}
        <div>
          <p className="text-sm text-muted-foreground">
            {t("stockValue.totalValue")}
          </p>
          <p className="text-3xl font-bold">
            {formatCurrency(summary.total_value)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("stockValue.itemCount", { count: summary.item_count })}
          </p>
        </div>

        {/* Breakdown */}
        <div className="space-y-4 border-t pt-4">
          {/* Merchandise */}
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <IconBox className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {t("stockValue.merchandise")}
                </p>
                <p className="text-sm font-medium">
                  {formatCurrency(summary.merchandise_value)}
                </p>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${merchandisePercentage}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {merchandisePercentage.toFixed(1)}% {t("stockValue.ofTotal")}
              </p>
            </div>
          </div>

          {/* Supplies */}
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <IconPackage className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{t("stockValue.supplies")}</p>
                <p className="text-sm font-medium">
                  {formatCurrency(summary.supply_value)}
                </p>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${supplyPercentage}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {supplyPercentage.toFixed(1)}% {t("stockValue.ofTotal")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
