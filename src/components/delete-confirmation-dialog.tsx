import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { deleteItem } from "@/lib/stock-queries";
import type { ItemWithStatus } from "@/lib/types/stock";
import { toast } from "sonner";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemWithStatus;
  onSuccess: () => void;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: DeleteConfirmationDialogProps) {
  const { t } = useTranslation(["stock"]);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    try {
      setDeleting(true);
      await deleteItem(item.id);
      toast.success(t("stock:delete.success"));
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error(t("stock:delete.error"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("stock:delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("stock:delete.message", { name: item.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>
            {t("stock:delete.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? t("stock:delete.deleting") : t("stock:delete.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
