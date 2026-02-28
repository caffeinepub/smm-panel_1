import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ClipboardList,
  Plus,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { OrderStatus, type ServiceOrder } from "../backend";
import {
  useGetCategories,
  useGetMyOrders,
  useGetServicesByCategory,
} from "../hooks/useQueries";

type SortField = "id" | "cost" | "quantity" | "status";
type SortDir = "asc" | "desc";

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = {
    [OrderStatus.pending]: {
      label: "Pending",
      className: "bg-amber-100 text-amber-700 border-amber-200",
    },
    [OrderStatus.completed]: {
      label: "Completed",
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    [OrderStatus.failed]: {
      label: "Failed",
      className: "bg-red-100 text-red-700 border-red-200",
    },
  };
  const { label, className } = config[status] || config[OrderStatus.pending];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {label}
    </span>
  );
}

// Pre-load all services for name lookup
function useAllServices() {
  const { data: categories = [] } = useGetCategories();
  // We'll use a map approach - fetch services for each category
  const cat1 = useGetServicesByCategory(categories[0]?.id ?? null);
  const cat2 = useGetServicesByCategory(categories[1]?.id ?? null);
  const cat3 = useGetServicesByCategory(categories[2]?.id ?? null);

  const allServices = [
    ...(cat1.data || []),
    ...(cat2.data || []),
    ...(cat3.data || []),
  ];

  return allServices;
}

function SortButton({
  field,
  currentField,
  direction,
  onClick,
  children,
}: {
  field: SortField;
  currentField: SortField;
  direction: SortDir;
  onClick: (f: SortField) => void;
  children: React.ReactNode;
}) {
  const isActive = field === currentField;
  return (
    <button
      type="button"
      onClick={() => onClick(field)}
      className="flex items-center gap-1 hover:text-primary transition-colors font-semibold"
    >
      {children}
      {isActive ? (
        direction === "asc" ? (
          <ArrowUp size={12} className="text-primary" />
        ) : (
          <ArrowDown size={12} className="text-primary" />
        )
      ) : (
        <ArrowUpDown size={12} className="text-muted-foreground/50" />
      )}
    </button>
  );
}

export default function Orders() {
  const { data: orders = [], isLoading } = useGetMyOrders();
  const allServices = useAllServices();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const getServiceName = (serviceId: bigint) => {
    const svc = allServices.find((s) => s.id === serviceId);
    return svc ? svc.name : `Service #${serviceId.toString()}`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const filtered = orders
    .filter((order) => {
      const matchesSearch =
        search === "" ||
        order.id.toString().includes(search) ||
        order.link.toLowerCase().includes(search.toLowerCase()) ||
        getServiceName(order.serviceId)
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "id") cmp = Number(a.id - b.id);
      else if (sortField === "cost") cmp = a.cost - b.cost;
      else if (sortField === "quantity") cmp = Number(a.quantity - b.quantity);
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const statusCounts = {
    all: orders.length,
    [OrderStatus.pending]: orders.filter(
      (o) => o.status === OrderStatus.pending,
    ).length,
    [OrderStatus.completed]: orders.filter(
      (o) => o.status === OrderStatus.completed,
    ).length,
    [OrderStatus.failed]: orders.filter((o) => o.status === OrderStatus.failed)
      .length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList size={22} className="text-primary" />
            My Orders
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track and manage all your SMM orders.
          </p>
        </div>
        <Link to="/new-order">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 flex-shrink-0">
            <Plus size={16} />
            <span className="hidden sm:inline">New Order</span>
          </Button>
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            "all",
            OrderStatus.pending,
            OrderStatus.completed,
            OrderStatus.failed,
          ] as const
        ).map((status) => {
          const labels = {
            all: "All",
            pending: "Pending",
            completed: "Completed",
            failed: "Failed",
          };
          const isActive = statusFilter === status;
          return (
            <button
              type="button"
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-purple-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                }
              `}
            >
              {labels[status]}
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${isActive ? "bg-white/20" : "bg-muted"}`}
              >
                {statusCounts[status]}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-base">Order History</CardTitle>
              <CardDescription className="text-xs">
                {filtered.length} orders found
              </CardDescription>
            </div>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm w-48 border-input focus-visible:ring-primary"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingCart size={24} className="text-primary" />
              </div>
              <p className="text-base font-semibold text-foreground mb-1">
                {orders.length === 0
                  ? "No orders yet"
                  : "No orders match your search"}
              </p>
              <p className="text-sm text-muted-foreground mb-5">
                {orders.length === 0
                  ? "Place your first order to start growing your social media presence."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {orders.length === 0 && (
                <Link to="/new-order">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                    <Plus size={15} />
                    Place First Order
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-xs w-16">
                      <SortButton
                        field="id"
                        currentField={sortField}
                        direction={sortDir}
                        onClick={handleSort}
                      >
                        ID
                      </SortButton>
                    </TableHead>
                    <TableHead className="text-xs">Service</TableHead>
                    <TableHead className="text-xs max-w-[160px]">
                      Link
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      <SortButton
                        field="quantity"
                        currentField={sortField}
                        direction={sortDir}
                        onClick={handleSort}
                      >
                        Qty
                      </SortButton>
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      <SortButton
                        field="cost"
                        currentField={sortField}
                        direction={sortDir}
                        onClick={handleSort}
                      >
                        Cost
                      </SortButton>
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      <SortButton
                        field="status"
                        currentField={sortField}
                        direction={sortDir}
                        onClick={handleSort}
                      >
                        Status
                      </SortButton>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order: ServiceOrder) => (
                    <TableRow
                      key={order.id.toString()}
                      className="border-border hover:bg-accent/40 transition-colors"
                    >
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        #{order.id.toString()}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground">
                        {getServiceName(order.serviceId)}
                      </TableCell>
                      <TableCell className="text-xs max-w-[160px]">
                        <a
                          href={order.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate block max-w-[140px]"
                          title={order.link}
                        >
                          {order.link}
                        </a>
                      </TableCell>
                      <TableCell className="text-xs text-right font-medium">
                        {Number(order.quantity).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-right font-semibold text-foreground">
                        ${order.cost.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <StatusBadge status={order.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} SMM Panel Pro. Built with{" "}
        <span className="text-red-500">♥</span> using{" "}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
