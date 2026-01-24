import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createCategory, createItem, updateItem } from "@/lib/stock-queries"
import { validateItemForm } from "@/lib/stock-utils"
import type {
  Category,
  ItemFormData,
  ItemType,
  ItemWithStatus,
} from "@/lib/types/stock"
import { cn } from "@/lib/utils"
import { IconCheck, IconChevronDown, IconPlus } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  item?: ItemWithStatus;
  categories: Category[];
  onSuccess: () => void;
}

export function ItemFormDialog({
  open,
  onOpenChange,
  mode,
  item,
  categories,
  onSuccess,
}: ItemFormDialogProps) {
  const { t } = useTranslation(["stock"]);

  // Form state
  const [formData, setFormData] = useState<ItemFormData>({
    name: "",
    type: "merchandise",
    category_id: null,
    price: 0,
    stock_quantity: 0,
    critical_threshold: 2,
    low_threshold: 5,
    is_favorite: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Category combobox state
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      if (mode === "edit" && item) {
        setFormData({
          name: item.name,
          type: item.type,
          category_id: item.category_id,
          price: item.price,
          stock_quantity: item.stock_quantity,
          critical_threshold: item.critical_threshold,
          low_threshold: item.low_threshold,
          is_favorite: item.is_favorite,
        });
      } else {
        setFormData({
          name: "",
          type: "merchandise",
          category_id: null,
          price: 0,
          stock_quantity: 0,
          critical_threshold: 2,
          low_threshold: 5,
          is_favorite: false,
        });
      }
      setErrors({});
      setCategorySearch("");
    }
  }, [open, mode, item]);

  function handleFieldChange(field: keyof ItemFormData, value: unknown) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }

  async function handleCreateCategory() {
    if (!categorySearch.trim()) return;

    try {
      setCreatingCategory(true);
      const newCategory = await createCategory(categorySearch.trim());
      handleFieldChange("category_id", newCategory.id);
      setCategoryOpen(false);
      setCategorySearch("");
      toast.success(t("stock:itemForm.success.created"), {
        description: newCategory.name,
      });
      // Trigger parent refetch to update categories list
      onSuccess();
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error(t("stock:itemForm.error.create"));
    } finally {
      setCreatingCategory(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate form
    const validationErrors = validateItemForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      if (mode === "create") {
        await createItem(formData);
        toast.success(t("stock:itemForm.success.created"));
      } else if (item) {
        await updateItem(item.id, formData);
        toast.success(t("stock:itemForm.success.updated"));
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save item:", error);
      toast.error(
        mode === "create"
          ? t("stock:itemForm.error.create")
          : t("stock:itemForm.error.update"),
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  const showCreateOption =
    categorySearch.trim() &&
    !filteredCategories.some(
      (cat) => cat.name.toLowerCase() === categorySearch.toLowerCase(),
    );

  const selectedCategory = categories.find(
    (cat) => cat.id === formData.category_id,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? t("stock:itemForm.createTitle")
              : t("stock:itemForm.editTitle")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="space-y-4">
            {/* Name */}
            <Field>
              <FieldLabel htmlFor="name">
                {t("stock:itemForm.fields.name")}
              </FieldLabel>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder={t("stock:itemForm.fields.namePlaceholder")}
                maxLength={100}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </Field>

            {/* Type */}
            <Field>
              <FieldLabel htmlFor="type">
                {t("stock:itemForm.fields.type")}
              </FieldLabel>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  handleFieldChange("type", value as ItemType)
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={"merchandise"}>
                    {t("stock:itemForm.fields.typeOptions.merchandise")}
                  </SelectItem>
                  <SelectItem value={"supply"}>
                    {t("stock:itemForm.fields.typeOptions.supply")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {/* Category */}
            <Field>
              <FieldLabel>{t("stock:itemForm.fields.category")}</FieldLabel>
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={categoryOpen}
                    className="w-full justify-between"
                  >
                    {selectedCategory
                      ? selectedCategory.name
                      : t("stock:itemForm.fields.categoryPlaceholder")}
                    <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder={t(
                        "stock:itemForm.fields.categoryPlaceholder",
                      )}
                      value={categorySearch}
                      onValueChange={setCategorySearch}
                    />
                    <CommandList>
                      <CommandEmpty>{t("stock:empty.noResults")}</CommandEmpty>
                      <CommandGroup>
                        {filteredCategories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={category.name}
                            onSelect={() => {
                              handleFieldChange("category_id", category.id);
                              setCategoryOpen(false);
                            }}
                          >
                            <IconCheck
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.category_id === category.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {category.name}
                          </CommandItem>
                        ))}
                        {showCreateOption && (
                          <CommandItem
                            onSelect={handleCreateCategory}
                            disabled={creatingCategory}
                            className="text-primary"
                          >
                            <IconPlus className="mr-2 h-4 w-4" />
                            {t("stock:itemForm.fields.categoryCreate", {
                              name: categorySearch,
                            })}
                          </CommandItem>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </Field>

            {/* Price and Stock in two columns */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="price">
                  {t("stock:itemForm.fields.price")}
                </FieldLabel>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    handleFieldChange("price", parseFloat(e.target.value) || 0)
                  }
                  placeholder={t("stock:itemForm.fields.pricePlaceholder")}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="stock_quantity">
                  {t("stock:itemForm.fields.stockQuantity")}
                </FieldLabel>
                <Input
                  id="stock_quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    handleFieldChange(
                      "stock_quantity",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder={t(
                    "stock:itemForm.fields.stockQuantityPlaceholder",
                  )}
                />
                {errors.stock_quantity && (
                  <p className="text-sm text-destructive">
                    {errors.stock_quantity}
                  </p>
                )}
              </Field>
            </div>

            {/* Thresholds */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="critical_threshold">
                  {t("stock:itemForm.fields.criticalThreshold")}
                </FieldLabel>
                <Input
                  id="critical_threshold"
                  type="number"
                  min="0"
                  value={formData.critical_threshold}
                  onChange={(e) =>
                    handleFieldChange(
                      "critical_threshold",
                      parseInt(e.target.value) || 0,
                    )
                  }
                />
                {errors.critical_threshold && (
                  <p className="text-sm text-destructive">
                    {errors.critical_threshold}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="low_threshold">
                  {t("stock:itemForm.fields.lowThreshold")}
                </FieldLabel>
                <Input
                  id="low_threshold"
                  type="number"
                  min="0"
                  value={formData.low_threshold}
                  onChange={(e) =>
                    handleFieldChange(
                      "low_threshold",
                      parseInt(e.target.value) || 0,
                    )
                  }
                />
              </Field>
            </div>

            {/* Is Favorite */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_favorite"
                checked={formData.is_favorite}
                onCheckedChange={(checked) =>
                  handleFieldChange("is_favorite", checked === true)
                }
              />
              <Label
                htmlFor="is_favorite"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("stock:itemForm.fields.isFavorite")}
              </Label>
            </div>
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
                ? mode === "create"
                  ? t("stock:itemForm.submit.creating")
                  : t("stock:itemForm.submit.editing")
                : mode === "create"
                  ? t("stock:itemForm.submit.create")
                  : t("stock:itemForm.submit.edit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
