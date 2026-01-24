import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconDotsVertical,
  IconEdit,
  IconAdjustments,
  IconHistory,
  IconTrash,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import type { ItemWithStatus, ViewMode } from "@/lib/types/stock";
import { getStatusBadgeVariant } from "@/lib/stock-utils";

interface StockItemCardProps {
  item: ItemWithStatus;
  viewMode: ViewMode;
  onEdit: () => void;
  onAdjust: () => void;
  onViewHistory: () => void;
  onDelete: () => void;
}

export function StockItemCard({
  item,
  viewMode,
  onEdit,
  onAdjust,
  onViewHistory,
  onDelete,
}: StockItemCardProps) {
  const { t } = useTranslation(["stock"]);

  if (viewMode === "list") {
    return (
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Favorite Icon */}
            <div className="flex-shrink-0">
              {item.is_favorite ? (
                <IconStarFilled className="h-5 w-5 text-yellow-500" />
              ) : (
                <IconStar className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            {/* Item Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{item.name}</h3>
                <Badge variant={getStatusBadgeVariant(item.status)}>
                  {t(`stock:status.${item.status}`)}
                </Badge>
              </div>
              {item.category && (
                <p className="text-sm text-muted-foreground">
                  {item.category.name}
                </p>
              )}
            </div>

            {/* Stock & Price */}
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center min-w-[60px]">
                <p className="text-muted-foreground">{t("stock:adjustment.currentStock")}</p>
                <p className="font-semibold">{item.stock_quantity}</p>
              </div>
              <div className="text-right min-w-[80px]">
                <p className="text-muted-foreground">{t("stock:itemForm.fields.price")}</p>
                <p className="font-semibold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(item.price)}
                </p>
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 h-12 w-12"
                >
                  <IconDotsVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <IconEdit className="mr-2 h-4 w-4" />
                  {t("stock:actions.editItem")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onAdjust}>
                  <IconAdjustments className="mr-2 h-4 w-4" />
                  {t("stock:actions.adjustStock")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewHistory}>
                  <IconHistory className="mr-2 h-4 w-4" />
                  {t("stock:actions.viewHistory")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <IconTrash className="mr-2 h-4 w-4" />
                  {t("stock:actions.deleteItem")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {item.is_favorite && (
                <IconStarFilled className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              )}
              <h3 className="font-semibold truncate">{item.name}</h3>
            </div>
            {item.category ? (
              <Badge variant="outline" className="text-xs">
                {item.category.name}
              </Badge>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t("stock:empty.noCategory")}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <IconEdit className="mr-2 h-4 w-4" />
                {t("stock:actions.editItem")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAdjust}>
                <IconAdjustments className="mr-2 h-4 w-4" />
                {t("stock:actions.adjustStock")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onViewHistory}>
                <IconHistory className="mr-2 h-4 w-4" />
                {t("stock:actions.viewHistory")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <IconTrash className="mr-2 h-4 w-4" />
                {t("stock:actions.deleteItem")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stock Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t("stock:adjustment.currentStock")}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{item.stock_quantity}</span>
            <Badge variant={getStatusBadgeVariant(item.status)} className="text-xs">
              {t(`stock:status.${item.status}`)}
            </Badge>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t("stock:itemForm.fields.price")}
          </span>
          <span className="font-semibold">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(item.price)}
          </span>
        </div>

        {/* Type Badge */}
        <div className="pt-2 border-t">
          <Badge variant="secondary" className="text-xs">
            {t(`stock:itemForm.fields.typeOptions.${item.type}`)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
