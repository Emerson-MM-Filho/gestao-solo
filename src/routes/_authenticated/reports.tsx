import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { IconAlertCircle } from "@tabler/icons-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ErrorBoundary } from "@/components/error-boundary";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { SalesSummaryCard } from "@/components/reports/sales-summary-card";
import { TopItemsCard } from "@/components/reports/top-items-card";
import { StockValueCard } from "@/components/reports/stock-value-card";
import { LowStockCard } from "@/components/reports/low-stock-card";

import {
  fetchClosedOrdersForReport,
  fetchItemsForStockValue,
  fetchLowStockItems,
} from "@/lib/report-queries";
import {
  getDateRangeForPreset,
  aggregateSalesSummary,
  aggregateTopSellingItems,
  calculateStockValueSummary,
} from "@/lib/report-utils";
import type { DateRange, DatePreset } from "@/lib/types/report";

export const Route = createFileRoute("/_authenticated/reports")({
  component: ReportsComponent,
});

function ReportsComponent() {
  const { t } = useTranslation(["reports", "common"]);

  // Date range state (default: last 30 days)
  const [preset, setPreset] = useState<DatePreset>("last_30_days");
  const [dateRange, setDateRange] = useState<DateRange>(
    getDateRangeForPreset("last_30_days"),
  );

  // Fetch data with React Query
  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["reports", "orders", dateRange],
    queryFn: () => fetchClosedOrdersForReport(dateRange),
  });

  const {
    data: stockItems = [],
    isLoading: stockLoading,
    error: stockError,
  } = useQuery({
    queryKey: ["reports", "stockValue"],
    queryFn: fetchItemsForStockValue,
  });

  const {
    data: lowStockItems = [],
    isLoading: lowStockLoading,
    error: lowStockError,
  } = useQuery({
    queryKey: ["reports", "lowStock"],
    queryFn: fetchLowStockItems,
  });

  // Client-side aggregations with useMemo
  const salesSummary = useMemo(
    () => aggregateSalesSummary(orders),
    [orders],
  );

  const topItems = useMemo(
    () => aggregateTopSellingItems(orders),
    [orders],
  );

  const stockValueSummary = useMemo(
    () => calculateStockValueSummary(stockItems),
    [stockItems],
  );

  // Check for errors
  const hasErrors = ordersError || stockError || lowStockError;

  return (
    <ErrorBoundary>
      <div className="min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold md:text-3xl">
              {t("reports:title")}
            </h1>
          </div>

          {/* Error Alert */}
          {hasErrors && (
            <Alert variant="destructive" className="mb-6">
              <IconAlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {ordersError && <div>{t("reports:errors.ordersLoadFailed")}</div>}
                {stockError && <div>{t("reports:errors.stockLoadFailed")}</div>}
                {lowStockError && <div>{t("reports:errors.lowStockLoadFailed")}</div>}
              </AlertDescription>
            </Alert>
          )}

          {/* Date Range Picker */}
          <div className="mb-6">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              preset={preset}
              onPresetChange={setPreset}
            />
          </div>

          {/* Reports Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sales Summary */}
            <div>
              <SalesSummaryCard data={salesSummary} isLoading={ordersLoading} />
            </div>

            {/* Top Selling Items */}
            <div>
              <TopItemsCard items={topItems} isLoading={ordersLoading} limit={10} />
            </div>

            {/* Stock Value */}
            <div>
              <StockValueCard
                summary={stockValueSummary}
                isLoading={stockLoading}
              />
            </div>

            {/* Low Stock Alerts */}
            <div>
              <LowStockCard items={lowStockItems} isLoading={lowStockLoading} />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
