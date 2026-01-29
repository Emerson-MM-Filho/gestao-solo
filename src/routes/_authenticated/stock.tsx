import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  IconPlus,
  IconRefresh,
  IconLayoutGrid,
  IconLayoutList,
} from "@tabler/icons-react";
import { fetchItems, fetchCategories } from "@/lib/stock-queries";
import { enrichItem } from "@/lib/stock-utils";
import { toggleItemFavorite, quickAdjustStock } from "@/lib/stock-actions";
import type {
  Item,
  ItemWithStatus,
  Category,
  SortOption,
  ViewMode,
} from "@/lib/types/stock";
import { StockItemCard } from "@/components/stock-item-card";
import { ItemFormDialog } from "@/components/item-form-dialog";
import { StockAdjustmentDialog } from "@/components/stock-adjustment-dialog";
import { StockHistoryDialog } from "@/components/stock-history-dialog";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { StockAlertsCard } from "@/components/stock-alerts-card";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/stock")({
  component: StockComponent,
});

function StockComponent() {
  const { t } = useTranslation(["stock"]);

  // Data state
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("alphabetical");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Dialog state
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [itemFormMode, setItemFormMode] = useState<"create" | "edit">("create");
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemWithStatus | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        fetchItems(),
        fetchCategories(),
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error(t("stock:error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    try {
      setRefreshing(true);
      const [itemsData, categoriesData] = await Promise.all([
        fetchItems(),
        fetchCategories(),
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
      toast.success(t("stock:actions.refresh"));
    } catch (error) {
      console.error("Failed to refresh data:", error);
      toast.error(t("stock:error"));
    } finally {
      setRefreshing(false);
    }
  }

  // Enrich items with computed properties
  const enrichedItems = useMemo<ItemWithStatus[]>(() => {
    return items.map(enrichItem);
  }, [items]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = enrichedItems;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.name.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((item) => item.category_id === categoryFilter);
    }

    // Sort
    switch (sortOption) {
      case "alphabetical":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "favorites":
        result = [...result].sort((a, b) => {
          if (a.is_favorite === b.is_favorite) {
            return a.name.localeCompare(b.name);
          }
          return a.is_favorite ? -1 : 1;
        });
        break;
      case "most-used":
        result = [...result].sort((a, b) => {
          if (a.usage_count === b.usage_count) {
            return a.name.localeCompare(b.name);
          }
          return b.usage_count - a.usage_count;
        });
        break;
    }

    return result;
  }, [enrichedItems, searchQuery, categoryFilter, sortOption]);

  // Action handlers
  function handleAddItem() {
    setItemFormMode("create");
    setSelectedItem(null);
    setItemFormOpen(true);
  }

  function handleEditItem(item: ItemWithStatus) {
    setItemFormMode("edit");
    setSelectedItem(item);
    setItemFormOpen(true);
  }

  function handleAdjustStock(item: ItemWithStatus) {
    setSelectedItem(item);
    setAdjustmentOpen(true);
  }

  function handleViewHistory(item: ItemWithStatus) {
    setSelectedItem(item);
    setHistoryOpen(true);
  }

  function handleDeleteItem(item: ItemWithStatus) {
    setSelectedItem(item);
    setDeleteOpen(true);
  }

  async function handleToggleFavorite(item: ItemWithStatus) {
    const newValue = !item.is_favorite;

    // Optimistic update
    setItems(items.map(i =>
      i.id === item.id ? { ...i, is_favorite: newValue } : i
    ));

    try {
      await toggleItemFavorite(item.id, item.is_favorite);
      toast.success(
        t(
          item.is_favorite
            ? "stock:actions.removedFromFavorites"
            : "stock:actions.addedToFavorites"
        )
      );
      await loadData();
    } catch (error) {
      // Revert on error
      setItems(items.map(i =>
        i.id === item.id ? { ...i, is_favorite: item.is_favorite } : i
      ));
      console.error("Failed to toggle favorite:", error);
      toast.error(t("stock:actions.toggleFavoriteError"));
    }
  }

  async function handleQuickAdjust(item: ItemWithStatus, delta: number) {
    try {
      await quickAdjustStock(item.id, delta);
      toast.success(t("stock:actions.quickAdjustSuccess"));
      await loadData();
    } catch (error) {
      console.error("Failed to quick adjust stock:", error);

      if (error instanceof Error) {
        if (error.message.includes("cannot be negative")) {
          toast.error(t("stock:adjustment.validation.insufficientStock"));
        } else if (error.message.includes("non-zero finite")) {
          toast.error(t("stock:actions.quickAdjustError"));
        } else {
          toast.error(t("stock:actions.quickAdjustError"));
        }
      } else {
        toast.error(t("stock:actions.quickAdjustError"));
      }
    }
  }

  async function handleOperationComplete() {
    // Refetch data after any operation
    await loadData();
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">{t("stock:loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t("stock:page.title")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("stock:page.description")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <IconRefresh className={refreshing ? "animate-spin" : ""} />
            </Button>
            <Button onClick={handleAddItem}>
              <IconPlus className="mr-2 h-4 w-4" />
              {t("stock:actions.addItem")}
            </Button>
          </div>
        </div>

        {/* Stock Alerts */}
        <StockAlertsCard
          items={enrichedItems}
          onFilterByStatus={(status) => {
            // TODO: Implement filter by status if needed
            console.log("Filter by status:", status);
          }}
        />

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <Input
            placeholder={t("stock:filters.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="lg:max-w-xs"
          />
          <Select
            value={categoryFilter || "all"}
            onValueChange={(value) =>
              setCategoryFilter(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="lg:max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("stock:filters.category")}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sortOption}
            onValueChange={(value) => setSortOption(value as SortOption)}
          >
            <SelectTrigger className="lg:max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alphabetical">
                {t("stock:filters.sort.alphabetical")}
              </SelectItem>
              <SelectItem value="favorites">
                {t("stock:filters.sort.favorites")}
              </SelectItem>
              <SelectItem value="most-used">
                {t("stock:filters.sort.mostUsed")}
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="lg:ml-auto">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => {
                if (value) setViewMode(value as ViewMode);
              }}
            >
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <IconLayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <IconLayoutList className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Items Display */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-semibold">
              {searchQuery || categoryFilter
                ? t("stock:empty.noResults")
                : t("stock:empty.title")}
            </h3>
            {!searchQuery && !categoryFilter && (
              <p className="text-muted-foreground mt-2">
                {t("stock:empty.description")}
              </p>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-2"
            }
          >
            {filteredItems.map((item) => (
              <StockItemCard
                key={item.id}
                item={item}
                viewMode={viewMode}
                onEdit={() => handleEditItem(item)}
                onAdjust={() => handleAdjustStock(item)}
                onViewHistory={() => handleViewHistory(item)}
                onDelete={() => handleDeleteItem(item)}
                onToggleFavorite={() => handleToggleFavorite(item)}
                onQuickAdjust={(delta) => handleQuickAdjust(item, delta)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ItemFormDialog
        open={itemFormOpen}
        onOpenChange={setItemFormOpen}
        mode={itemFormMode}
        item={itemFormMode === "edit" ? selectedItem ?? undefined : undefined}
        categories={categories}
        onSuccess={handleOperationComplete}
      />

      {selectedItem && (
        <>
          <StockAdjustmentDialog
            open={adjustmentOpen}
            onOpenChange={setAdjustmentOpen}
            item={selectedItem}
            onSuccess={handleOperationComplete}
          />

          <StockHistoryDialog
            open={historyOpen}
            onOpenChange={setHistoryOpen}
            item={selectedItem}
          />

          <DeleteConfirmationDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            item={selectedItem}
            onSuccess={handleOperationComplete}
          />
        </>
      )}
    </div>
  );
}
