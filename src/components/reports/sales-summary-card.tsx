import { useTranslation } from "react-i18next";
import { IconCash, IconReceipt, IconShoppingCart } from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SalesSummaryData } from "@/lib/types/report";
import { formatCurrency } from "@/lib/report-utils";

interface SalesSummaryCardProps {
  data: SalesSummaryData;
  isLoading?: boolean;
}

export function SalesSummaryCard({ data, isLoading }: SalesSummaryCardProps) {
  const { t } = useTranslation("reports");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("salesSummary.title")}</CardTitle>
          <CardDescription>{t("salesSummary.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("salesSummary.title")}</CardTitle>
        <CardDescription>{t("salesSummary.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Revenue */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
            <IconCash className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("salesSummary.totalRevenue")}
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(data.total_revenue)}
            </p>
          </div>
        </div>

        {/* Order Count */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <IconReceipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("salesSummary.orderCount")}
            </p>
            <p className="text-2xl font-bold">{data.order_count}</p>
          </div>
        </div>

        {/* Items Sold */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
            <IconShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("salesSummary.itemsSold")}
            </p>
            <p className="text-2xl font-bold">{data.items_sold}</p>
          </div>
        </div>

        {/* Payment Breakdown */}
        {data.payment_breakdown.length > 0 && (
          <div className="border-t pt-4">
            <p className="mb-3 text-sm font-medium">
              {t("salesSummary.paymentBreakdown")}
            </p>
            <div className="space-y-2">
              {data.payment_breakdown.map((payment) => {
                const paymentKey = `paymentMethods.${payment.method}`;
                return (
                  <div
                    key={payment.method}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {t(paymentKey as never)} ({payment.count})
                    </span>
                    <span className="font-medium">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
