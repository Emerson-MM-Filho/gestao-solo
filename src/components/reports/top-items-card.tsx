import { useTranslation } from "react-i18next";
import { IconTrendingUp } from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TopSellingItem } from "@/lib/types/report";
import { formatCurrency } from "@/lib/report-utils";

interface TopItemsCardProps {
  items: TopSellingItem[];
  isLoading?: boolean;
  limit?: number;
}

export function TopItemsCard({
  items,
  isLoading,
  limit = 10,
}: TopItemsCardProps) {
  const { t } = useTranslation("reports");

  const displayItems = items.slice(0, limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("topItems.title")}</CardTitle>
          <CardDescription>{t("topItems.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("topItems.title")}</CardTitle>
          <CardDescription>{t("topItems.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <IconTrendingUp className="mb-2 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {t("topItems.noData")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("topItems.title")}</CardTitle>
        <CardDescription>{t("topItems.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("topItems.table.rank")}</TableHead>
                <TableHead>{t("topItems.table.item")}</TableHead>
                <TableHead className="text-right">
                  {t("topItems.table.quantity")}
                </TableHead>
                <TableHead className="text-right">
                  {t("topItems.table.revenue")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayItems.map((item, index) => (
                <TableRow key={item.item_id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.item_name}</div>
                      {item.category_name && (
                        <div className="text-xs text-muted-foreground">
                          {item.category_name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.total_quantity_sold.toLocaleString("pt-BR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.total_revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
