import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { fetchItemMovements } from "@/lib/stock-queries";
import { formatStockMovementType } from "@/lib/stock-utils";
import type { ItemWithStatus, StockMovement } from "@/lib/types/stock";
import { toast } from "sonner";

interface StockHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemWithStatus;
}

export function StockHistoryDialog({
  open,
  onOpenChange,
  item,
}: StockHistoryDialogProps) {
  const { t, i18n } = useTranslation(["stock"]);

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadMovements();
    }
  }, [open, item.id]);

  async function loadMovements() {
    try {
      setLoading(true);
      const data = await fetchItemMovements(item.id);
      setMovements(data);
    } catch (error) {
      console.error("Failed to load movements:", error);
      toast.error(t("stock:error"));
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t("stock:history.title")}</DialogTitle>
          <DialogDescription>{item.name}</DialogDescription>
        </DialogHeader>

        <div className="overflow-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">{t("stock:history.loading")}</p>
            </div>
          ) : movements.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">{t("stock:history.empty")}</p>
            </div>
          ) : (
            <>
              {/* Desktop: Table view */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("stock:history.columns.date")}</TableHead>
                      <TableHead>{t("stock:history.columns.type")}</TableHead>
                      <TableHead className="text-right">
                        {t("stock:history.columns.quantity")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("stock:history.columns.balance")}
                      </TableHead>
                      <TableHead>{t("stock:history.columns.notes")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(movement.created_at)}
                        </TableCell>
                        <TableCell>
                          {formatStockMovementType(movement.type, t)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            movement.type === "entry"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {movement.type === "entry" ? "+" : "-"}
                          {movement.quantity}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {movement.balance_after}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {movement.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile: Card view */}
              <div className="md:hidden space-y-3">
                {movements.map((movement) => (
                  <Card key={movement.id}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {formatStockMovementType(movement.type, t)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(movement.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-lg font-bold ${
                              movement.type === "entry"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {movement.type === "entry" ? "+" : "-"}
                            {movement.quantity}
                          </span>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {t("stock:history.columns.balance")}
                            </p>
                            <p className="text-lg font-semibold">
                              {movement.balance_after}
                            </p>
                          </div>
                        </div>
                        {movement.notes && (
                          <p className="text-sm text-muted-foreground pt-2 border-t">
                            {movement.notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
