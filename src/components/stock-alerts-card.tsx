import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { ItemWithStatus, StockStatusType } from "@/lib/types/stock"
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconChevronDown,
} from "@tabler/icons-react"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

interface StockAlertsCardProps {
  items: ItemWithStatus[];
  onFilterByStatus?: (status: StockStatusType) => void;
}

export function StockAlertsCard({
  items,
  onFilterByStatus,
}: StockAlertsCardProps) {
  const { t } = useTranslation(["stock"]);
  const [isOpen, setIsOpen] = useState(false);

  const { criticalItems, lowItems } = useMemo(() => {
    const critical = items.filter((item) => item.status === "critical");
    const low = items.filter((item) => item.status === "low");
    return { criticalItems: critical, lowItems: low };
  }, [items]);

  const hasAlerts = criticalItems.length > 0 || lowItems.length > 0;

  if (!hasAlerts) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-3 p-4">
          <IconCheck className="h-5 w-5 text-green-600" />
          <p className="text-sm font-medium text-green-900">
            {t("stock:alerts.none")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconAlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-base">
                {t("stock:alerts.title")}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {criticalItems.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <IconAlertCircle className="h-3 w-3" />
                  {t("stock:alerts.criticalCount", {
                    count: criticalItems.length,
                  })}
                </Badge>
              )}
              {lowItems.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <IconAlertTriangle className="h-3 w-3" />
                  {t("stock:alerts.lowCount", { count: lowItems.length })}
                </Badge>
              )}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <IconChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Critical Items */}
            {criticalItems.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <IconAlertCircle className="h-4 w-4" />
                  {t("stock:alerts.critical")}
                </h4>
                <div className="space-y-1">
                  {criticalItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-white rounded border border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                      onClick={() => onFilterByStatus?.("critical")}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        {item.category && (
                          <p className="text-xs text-muted-foreground">
                            {item.category.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">
                          {item.stock_quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("stock:adjustment.currentStock")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Stock Items */}
            {lowItems.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <IconAlertTriangle className="h-4 w-4" />
                  {t("stock:alerts.low")}
                </h4>
                <div className="space-y-1">
                  {lowItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-white rounded border border-yellow-200 hover:bg-yellow-50 transition-colors cursor-pointer"
                      onClick={() => onFilterByStatus?.("low")}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        {item.category && (
                          <p className="text-xs text-muted-foreground">
                            {item.category.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-yellow-600">
                          {item.stock_quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("stock:adjustment.currentStock")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
