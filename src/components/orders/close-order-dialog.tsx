import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { closeOrder } from "@/lib/order-queries";
import {
  PaymentMethodOptions,
  type PaymentMethod,
  type PaymentData,
} from "@/lib/types/order";
import { formatCurrency, validatePayments } from "@/lib/order-utils";

interface CloseOrderDialogProps {
  orderId: string | null;
  orderTotal: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CloseOrderDialog({
  orderId,
  orderTotal,
  open,
  onOpenChange,
  onSuccess,
}: CloseOrderDialogProps) {
  const { t } = useTranslation(["orders"]);
  const queryClient = useQueryClient();
  const [payments, setPayments] = useState<PaymentData[]>([
    { method: "cash", amount: orderTotal },
  ]);

  const closeMutation = useMutation({
    mutationFn: (data: { orderId: string; payments: PaymentData[] }) =>
      closeOrder(data.orderId, { payments: data.payments }),
    onSuccess: (result: any) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        onOpenChange(false);
        onSuccess();
        toast.success(t("orders:messages.orderClosed"));
        resetForm();
      } else {
        if (result.error === "Payment total does not match order total") {
          toast.error(t("orders:messages.paymentMismatch"));
        } else {
          toast.error(result.error || t("orders:errors.closeOrder"));
        }
      }
    },
    onError: () => {
      toast.error(t("orders:errors.closeOrder"));
    },
  });

  const resetForm = () => {
    setPayments([{ method: "cash", amount: orderTotal }]);
  };

  const handleAddPayment = () => {
    setPayments([...payments, { method: "cash", amount: 0 }]);
  };

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleUpdatePayment = (
    index: number,
    field: "method" | "amount",
    value: string | number,
  ) => {
    const updated = [...payments];
    if (field === "method") {
      updated[index].method = value as PaymentMethod;
    } else {
      updated[index].amount = typeof value === "string" ? parseFloat(value) : value;
    }
    setPayments(updated);
  };

  const handleClose = () => {
    if (!orderId) return;

    const validationError = validatePayments(payments, orderTotal);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    closeMutation.mutate({ orderId, payments });
  };

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const difference = totalPaid - orderTotal;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("orders:detailsDialog.closeOrder")}</DialogTitle>
          <DialogDescription>
            {t("orders:closeOrderDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted p-3">
            <div className="flex justify-between text-sm">
              <span>{t("orders:closeOrderDialog.orderTotal")}</span>
              <span className="font-semibold">
                {formatCurrency(orderTotal)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t("orders:closeOrderDialog.paymentsLabel")}</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddPayment}
                aria-label={t("orders:closeOrderDialog.addPaymentButton")}
              >
                <IconPlus className="h-4 w-4" aria-hidden="true" />
                {t("orders:closeOrderDialog.addPaymentButton")}
              </Button>
            </div>

            {payments.map((payment, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Select
                    value={payment.method}
                    onValueChange={(value) =>
                      handleUpdatePayment(index, "method", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PaymentMethodOptions.PIX}>
                        {t("orders:paymentMethods.pix")}
                      </SelectItem>
                      <SelectItem value={PaymentMethodOptions.CREDIT}>
                        {t("orders:paymentMethods.credit")}
                      </SelectItem>
                      <SelectItem value={PaymentMethodOptions.DEBIT}>
                        {t("orders:paymentMethods.debit")}
                      </SelectItem>
                      <SelectItem value={PaymentMethodOptions.CASH}>
                        {t("orders:paymentMethods.cash")}
                      </SelectItem>
                      <SelectItem value={PaymentMethodOptions.VOUCHER}>
                        {t("orders:paymentMethods.voucher")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    value={payment.amount || ""}
                    onChange={(e) =>
                      handleUpdatePayment(index, "amount", e.target.value)
                    }
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                {payments.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemovePayment(index)}
                    aria-label={t("orders:closeOrderDialog.addPaymentButton")}
                  >
                    <IconTrash className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t("orders:closeOrderDialog.totalPaid")}</span>
              <span className={difference !== 0 ? "text-destructive" : ""}>
                {formatCurrency(totalPaid)}
              </span>
            </div>
            {difference !== 0 && (
              <div className="flex justify-between text-sm font-medium">
                <span>{t("orders:closeOrderDialog.difference")}</span>
                <span className="text-destructive">
                  {formatCurrency(Math.abs(difference))}
                  {difference > 0 ? t("orders:closeOrderDialog.overpaid") : t("orders:closeOrderDialog.underpaid")}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
          >
            {t("orders:closeOrderDialog.cancel")}
          </Button>
          <Button
            onClick={handleClose}
            disabled={closeMutation.isPending || difference !== 0}
          >
            {t("orders:closeOrderDialog.closeOrderButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
