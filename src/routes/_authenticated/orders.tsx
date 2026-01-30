import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IconPlus, IconReceipt } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import { fetchOrders, createOrder } from "@/lib/order-queries";
import type { OrderStatus, Order } from "@/lib/types/order";
import {
  formatOrderAge,
  getOrderStatusVariant,
  formatCurrency,
  validateCustomerName,
} from "@/lib/order-utils";
import { OrderDetailsDialog } from "@/components/orders/order-details-dialog";
import { OrderCardSkeleton } from "@/components/orders/order-card-skeleton";
import { ErrorBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/_authenticated/orders")({
  component: OrdersComponent,
});

function OrdersComponent() {
  const { t } = useTranslation(["orders", "common"]);
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerNameError, setCustomerNameError] = useState<string | null>(
    null,
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", statusFilter],
    queryFn: () =>
      fetchOrders(statusFilter === "all" ? undefined : statusFilter),
  });

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setCreateDialogOpen(false);
      setCustomerName("");
      setCustomerNameError(null);
      toast.success(t("orders:messages.orderCreated"));
    },
    onError: () => {
      toast.error(t("orders:errors.createOrder"));
    },
  });

  const handleCreateOrder = () => {
    const error = validateCustomerName(customerName);
    if (error) {
      setCustomerNameError(error);
      return;
    }

    createMutation.mutate({ customer_name: customerName.trim() });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold md:text-3xl">
            {t("orders:title")}
          </h1>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button aria-label={t("orders:newOrder")}>
                <IconPlus className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t("orders:newOrder")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("orders:createDialog.title")}</DialogTitle>
                <DialogDescription>
                  {t("orders:createDialog.description")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">
                    {t("orders:createDialog.customerName")}
                  </Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setCustomerNameError(null);
                    }}
                    placeholder={t(
                      "orders:createDialog.customerNamePlaceholder",
                    )}
                    maxLength={100}
                  />
                  {customerNameError && (
                    <p className="text-sm text-destructive">
                      {customerNameError}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setCustomerName("");
                    setCustomerNameError(null);
                  }}
                >
                  {t("orders:createDialog.cancel")}
                </Button>
                <Button
                  onClick={handleCreateOrder}
                  disabled={createMutation.isPending}
                >
                  {t("orders:createDialog.create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Status Filter */}
        <Tabs
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">{t("orders:filters.all")}</TabsTrigger>
            <TabsTrigger value="open">{t("orders:filters.open")}</TabsTrigger>
            <TabsTrigger value="closed">
              {t("orders:filters.closed")}
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              {t("orders:filters.cancelled")}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Orders List */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading orders">
            {Array.from({ length: 6 }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
            <IconReceipt className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium">{t("orders:noOrders")}</p>
            <p className="text-sm text-muted-foreground">
              {t("orders:createFirstOrder")}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order: Order) => (
              <button
                key={order.id}
                className="rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent"
                onClick={() => {
                  setSelectedOrderId(order.id);
                  setDetailsDialogOpen(true);
                }}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      #{order.display_id}
                    </div>
                    <div className="font-medium">{order.customer_name}</div>
                  </div>
                  <Badge variant={getOrderStatusVariant(order.status)}>
                    {t(`orders:status.${order.status}` as any)}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("orders:card.total")}:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("orders:card.age")}:
                    </span>
                    <span>{formatOrderAge(order.created_at)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        </div>

        <OrderDetailsDialog
          orderId={selectedOrderId}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      </div>
    </ErrorBoundary>
  );
}
