import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { fetchItems } from "@/lib/stock-queries";
import { addItemToOrder } from "@/lib/order-queries";
import { formatCurrency } from "@/lib/order-utils";
import type { Item } from "@/lib/types/stock";

interface AddItemDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddItemDialog({
  orderId,
  open,
  onOpenChange,
}: AddItemDialogProps) {
  const { t } = useTranslation(["orders", "stock"]);
  const queryClient = useQueryClient();
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customizations, setCustomizations] = useState("");

  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
    enabled: open,
  });

  const activeItems = items.filter((item: Item) => item.is_active);

  const addMutation = useMutation({
    mutationFn: (data: { orderId: string; itemData: any }) =>
      addItemToOrder(data.orderId, data.itemData),
    onSuccess: (result: any) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        onOpenChange(false);
        resetForm();
        toast.success(t("orders:messages.itemAdded"));
      } else {
        if (result.error === "Insufficient stock") {
          toast.error(
            t("orders:messages.insufficientStock", {
              available: result.available,
            }),
          );
        } else {
          toast.error(result.error || t("orders:errors.addItem"));
        }
      }
    },
    onError: () => {
      toast.error(t("orders:errors.addItem"));
    },
  });

  const resetForm = () => {
    setSelectedItemId("");
    setQuantity("1");
    setCustomizations("");
  };

  const handleAdd = () => {
    if (!orderId || !selectedItemId) return;

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast.error(t("orders:errors.invalidQuantity"));
      return;
    }

    // Parse customizations - one per line
    const customizationsArray = customizations
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((notes) => ({ notes }));

    addMutation.mutate({
      orderId,
      itemData: {
        item_id: selectedItemId,
        quantity: quantityNum,
        customizations:
          customizationsArray.length > 0 ? customizationsArray : null,
      },
    });
  };

  const selectedItem = activeItems.find((item: Item) => item.id === selectedItemId);

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
          <DialogTitle>{t("orders:detailsDialog.addItem")}</DialogTitle>
          <DialogDescription>
            {t("orders:addItemDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("orders:addItemDialog.itemLabel")}</Label>
            <Select value={selectedItemId} onValueChange={setSelectedItemId}>
              <SelectTrigger>
                <SelectValue placeholder={t("orders:addItemDialog.selectItemPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {activeItems.map((item: Item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} - {formatCurrency(item.price)}
                    {item.type === "merchandise" &&
                      ` (${t("orders:addItemDialog.stockLabel", { stock: item.stock_quantity })})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">{t("orders:addItemDialog.quantityLabel")}</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0.01"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customizations">
              {t("orders:addItemDialog.customizationsLabel")}
            </Label>
            <Input
              id="customizations"
              value={customizations}
              onChange={(e) => setCustomizations(e.target.value)}
              placeholder={t("orders:addItemDialog.customizationsPlaceholder")}
              className="h-20"
            />
            <p className="text-xs text-muted-foreground">
              {t("orders:addItemDialog.customizationsHelper", { quantity })}
            </p>
          </div>

          {selectedItem && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <div className="flex justify-between">
                <span>{t("orders:addItemDialog.subtotal")}</span>
                <span className="font-medium">
                  {formatCurrency(selectedItem.price * parseFloat(quantity || "0"))}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("orders:addItemDialog.cancel")}
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedItemId || addMutation.isPending}
          >
            {t("orders:addItemDialog.addItem")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
