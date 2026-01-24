import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { recordStockMovement } from "@/lib/stock-queries"
import type {
  ItemWithStatus,
  StockAdjustmentFormData,
} from "@/lib/types/stock"
import { IconMinus, IconPlus } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

interface StockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemWithStatus;
  onSuccess: () => void;
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: StockAdjustmentDialogProps) {
  const { t } = useTranslation(["stock"]);

  const [formData, setFormData] = useState<StockAdjustmentFormData>({
    type: "entrada",
    quantity: 0,
    notes: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        type: "entrada",
        quantity: 0,
        notes: null,
      });
      setError("");
    }
  }, [open]);

  const projectedStock =
    formData.type === "entrada"
      ? item.stock_quantity + formData.quantity
      : item.stock_quantity - formData.quantity;

  function handleQuantityChange(value: number) {
    setFormData((prev) => ({ ...prev, quantity: value }));
    setError("");
  }

  function incrementQuantity() {
    handleQuantityChange(formData.quantity + 1);
  }

  function decrementQuantity() {
    if (formData.quantity > 0) {
      handleQuantityChange(formData.quantity - 1);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (formData.quantity <= 0) {
      setError(t("stock:adjustment.validation.quantityPositive"));
      return;
    }

    if (
      formData.type === "saida_manual" &&
      formData.quantity > item.stock_quantity
    ) {
      setError(t("stock:adjustment.validation.insufficientStock"));
      return;
    }

    try {
      setLoading(true);
      await recordStockMovement(item.id, formData);
      toast.success(t("stock:adjustment.success"));
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to adjust stock:", error);
      toast.error(t("stock:adjustment.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("stock:adjustment.title")}</DialogTitle>
          <DialogDescription>{item.name}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="space-y-4">
            {/* Type */}
            <Field>
              <FieldLabel htmlFor="type">
                {t("stock:adjustment.type")}
              </FieldLabel>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value as "entrada" | "saida_manual",
                  }))
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={"entrada"}>
                    {t("stock:adjustment.typeOptions.entry")}
                  </SelectItem>
                  <SelectItem value={"saida_manual"}>
                    {t("stock:adjustment.typeOptions.manual_exit")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* Quantity with +/- buttons */}
            <Field>
              <FieldLabel htmlFor="quantity">
                {t("stock:adjustment.quantity")}
              </FieldLabel>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={formData.quantity <= 0}
                  className="h-12 w-12"
                >
                  <IconMinus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleQuantityChange(parseFloat(e.target.value) || 0)
                  }
                  placeholder={t("stock:adjustment.quantityPlaceholder")}
                  className="text-center text-lg font-semibold"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  className="h-12 w-12"
                >
                  <IconPlus className="h-4 w-4" />
                </Button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </Field>

            {/* Current and Projected Stock */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("stock:adjustment.currentStock")}
                </p>
                <p className="text-2xl font-bold">{item.stock_quantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("stock:adjustment.newStock")}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    projectedStock < 0
                      ? "text-destructive"
                      : projectedStock > item.stock_quantity
                        ? "text-green-600"
                        : "text-red-600"
                  }`}
                >
                  {projectedStock}
                </p>
              </div>
            </div>

            {/* Notes */}
            <Field>
              <FieldLabel htmlFor="notes">
                {t("stock:adjustment.notes")}
              </FieldLabel>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    notes: e.target.value || null,
                  }))
                }
                placeholder={t("stock:adjustment.notesPlaceholder")}
                rows={3}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t("stock:delete.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? t("stock:adjustment.submitting")
                : t("stock:adjustment.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
