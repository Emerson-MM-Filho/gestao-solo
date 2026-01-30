import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  IconTrash,
  IconPlus,
  IconX,
  IconCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  fetchOrderById,
  removeItemFromOrder,
  deleteOrder,
} from "@/lib/order-queries";
import {
  formatCurrency,
  getOrderStatusVariant,
  canEditOrder,
  canCancelOrder,
} from "@/lib/order-utils";
import type { OrderItem, Payment, Customization } from "@/lib/types/order";
import { AddItemDialog } from "./add-item-dialog";
import { CloseOrderDialog } from "./close-order-dialog";
import { CancelOrderDialog } from "./cancel-order-dialog";

interface OrderDetailsDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDialog({
  orderId,
  open,
  onOpenChange,
}: OrderDetailsDialogProps) {
  const { t } = useTranslation(["orders"]);
  const queryClient = useQueryClient();
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [closeOrderDialogOpen, setCloseOrderDialogOpen] = useState(false);
  const [cancelOrderDialogOpen, setCancelOrderDialogOpen] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderById(orderId!),
    enabled: !!orderId && open,
  });

  const removeItemMutation = useMutation({
    mutationFn: removeItemFromOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setItemToRemove(null);
      toast.success(t("orders:messages.itemRemoved"));
    },
    onError: () => {
      toast.error(t("orders:errors.removeItem"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setDeleteAlertOpen(false);
      onOpenChange(false);
      toast.success(t("orders:messages.orderDeleted"));
    },
    onError: (error: Error) => {
      toast.error(error.message || t("orders:errors.deleteOrder"));
    },
  });

  const handleRemoveItem = (orderItemId: string) => {
    setItemToRemove(orderItemId);
  };

  const confirmRemoveItem = () => {
    if (itemToRemove) {
      removeItemMutation.mutate(itemToRemove);
    }
  };

  const handleDeleteOrder = () => {
    if (orderId) {
      deleteMutation.mutate(orderId);
    }
  };

  if (!orderId) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {order
                ? t("orders:detailsDialog.title", {
                    displayId: order.display_id,
                  })
                : t("orders:detailsDialog.title", { displayId: "..." })}
            </DialogTitle>
            <DialogDescription>
              {order && (
                <div className="flex items-center gap-2">
                  <span>{order.customer_name}</span>
                  <Badge variant={getOrderStatusVariant(order.status)}>
                    {t(`orders:status.${order.status}` as any)}
                  </Badge>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading...
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Items Section */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">
                    {t("orders:detailsDialog.items")}
                  </h3>
                  {canEditOrder(order.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAddItemDialogOpen(true)}
                      aria-label={t("orders:detailsDialog.addItem")}
                    >
                      <IconPlus className="h-4 w-4" aria-hidden="true" />
                      {t("orders:detailsDialog.addItem")}
                    </Button>
                  )}
                </div>

                {order.items.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {t("orders:detailsDialog.noItems")}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {order.items.map((orderItem: OrderItem) => (
                      <div
                        key={orderItem.id}
                        className="rounded-lg border p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">
                              {orderItem.item?.name || "Unknown Item"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {orderItem.quantity} x{" "}
                              {formatCurrency(orderItem.unit_price)} ={" "}
                              {formatCurrency(
                                orderItem.quantity * orderItem.unit_price,
                              )}
                            </div>
                            {orderItem.customizations &&
                              orderItem.customizations.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {orderItem.customizations.map(
                                    (custom: Customization, idx: number) => (
                                      <div
                                        key={idx}
                                        className="text-xs text-muted-foreground"
                                      >
                                        Unit {idx + 1}: {custom.notes}
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                          </div>
                          {canEditOrder(order.status) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveItem(orderItem.id)}
                              aria-label="Remove item"
                            >
                              <IconTrash className="h-4 w-4" aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>{t("orders:detailsDialog.total")}</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>

              {/* Payments (if closed) */}
              {order.status === "closed" && order.payments.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-3 font-semibold">
                      {t("orders:detailsDialog.payments")}
                    </h3>
                    <div className="space-y-2">
                      {order.payments.map((payment: Payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="capitalize">{payment.method}</span>
                          <span>{formatCurrency(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {order.status === "open" && order.total_amount > 0 && (
                  <Button
                    className="flex-1"
                    onClick={() => setCloseOrderDialogOpen(true)}
                    aria-label={t("orders:detailsDialog.closeOrder")}
                  >
                    <IconCheck className="h-4 w-4" aria-hidden="true" />
                    {t("orders:detailsDialog.closeOrder")}
                  </Button>
                )}

                {canCancelOrder(order.status) && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setCancelOrderDialogOpen(true)}
                    aria-label={t("orders:detailsDialog.cancelOrder")}
                  >
                    <IconX className="h-4 w-4" aria-hidden="true" />
                    {t("orders:detailsDialog.cancelOrder")}
                  </Button>
                )}

                {order.status === "open" && order.items.length === 0 && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setDeleteAlertOpen(true)}
                    aria-label={t("orders:detailsDialog.deleteOrder")}
                  >
                    <IconTrash className="h-4 w-4" aria-hidden="true" />
                    {t("orders:detailsDialog.deleteOrder")}
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <IconAlertTriangle className="h-5 w-5 text-destructive" />
              {t("orders:detailsDialog.deleteOrder")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Item Confirmation Alert */}
      <AlertDialog
        open={!!itemToRemove}
        onOpenChange={(open) => !open && setItemToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from the order?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveItem}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Item Dialog */}
      <AddItemDialog
        orderId={orderId}
        open={addItemDialogOpen}
        onOpenChange={setAddItemDialogOpen}
      />

      {/* Close Order Dialog */}
      {order && (
        <CloseOrderDialog
          orderId={orderId}
          orderTotal={order.total_amount}
          open={closeOrderDialogOpen}
          onOpenChange={setCloseOrderDialogOpen}
          onSuccess={() => onOpenChange(false)}
        />
      )}

      {/* Cancel Order Dialog */}
      <CancelOrderDialog
        orderId={orderId}
        open={cancelOrderDialogOpen}
        onOpenChange={setCancelOrderDialogOpen}
        onSuccess={() => onOpenChange(false)}
      />
    </>
  );
}
