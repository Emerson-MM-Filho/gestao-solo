import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

import { cancelOrder } from "@/lib/order-queries";

interface CancelOrderDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CancelOrderDialog({
  orderId,
  open,
  onOpenChange,
  onSuccess,
}: CancelOrderDialogProps) {
  const { t } = useTranslation(["orders"]);
  const queryClient = useQueryClient();
  const [returnStock, setReturnStock] = useState(true);
  const [reason, setReason] = useState("");

  const cancelMutation = useMutation({
    mutationFn: (data: { orderId: string; returnStock: boolean; reason: string }) =>
      cancelOrder(data.orderId, {
        return_stock: data.returnStock,
        reason: data.reason || null,
      }),
    onSuccess: (result: any) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        onOpenChange(false);
        onSuccess();
        toast.success(t("orders:messages.orderCancelled"));
        resetForm();
      } else {
        toast.error(result.error || t("orders:errors.cancelOrder"));
      }
    },
    onError: () => {
      toast.error(t("orders:errors.cancelOrder"));
    },
  });

  const resetForm = () => {
    setReturnStock(true);
    setReason("");
  };

  const handleCancel = () => {
    if (!orderId) return;
    cancelMutation.mutate({ orderId, returnStock, reason });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("orders:detailsDialog.cancelOrder")}</DialogTitle>
          <DialogDescription>
            {t("orders:cancelOrderDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="returnStock"
              checked={returnStock}
              onCheckedChange={(checked) => setReturnStock(checked as boolean)}
            />
            <Label
              htmlFor="returnStock"
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t("orders:cancelOrderDialog.returnStockLabel")}
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">{t("orders:cancelOrderDialog.reasonLabel")}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("orders:cancelOrderDialog.reasonPlaceholder")}
              rows={3}
            />
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
            {t("orders:cancelOrderDialog.backButton")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
          >
            {t("orders:cancelOrderDialog.cancelOrderButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
