import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
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
  AlertCircle,
  ArrowRight,
  Check,
  ClipboardList,
  Copy,
  Plus,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../backend";
import {
  useDeposit,
  useGetBalance,
  useGetCategories,
  useGetMyOrders,
} from "../hooks/useQueries";
import { useGetCallerUserProfile } from "../hooks/useQueries";

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
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {label}
    </span>
  );
}

const UPI_ID = "8825245372-13c6@ibl";

function DepositDialog() {
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const deposit = useDeposit();

  const handleDeposit = async () => {
    const val = Number.parseFloat(amount);
    if (Number.isNaN(val) || val <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await deposit.mutateAsync(val);
      toast.success(`₹${val.toFixed(2)} added to your balance!`);
      setAmount("");
      setOpen(false);
    } catch {
      toast.error("Failed to deposit funds");
    }
  };

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      toast.success("UPI ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy UPI ID");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-primary/30 text-primary hover:bg-primary/5 gap-1.5"
        >
          <Plus size={14} />
          Add Funds
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Enter the amount you want to add to your balance.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="deposit-amount">Amount (INR)</Label>
            <Input
              id="deposit-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="focus-visible:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            {[10, 25, 50, 100].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className="flex-1 py-1.5 text-xs font-medium rounded-md border border-primary/20 text-primary hover:bg-primary/5 transition-colors"
              >
                ₹{preset}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* UPI Payment Section */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="text-base">💳</span>
            Pay via UPI
          </p>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-xl border-2 border-primary/20 p-2 bg-white shadow-sm">
              <img
                src="/assets/uploads/AccountQRCodeFino-Payments-Bank-4703_LIGHT_THEME-1-1.png"
                alt="UPI QR Code - PhonePe"
                className="w-44 h-44 object-contain rounded-lg"
              />
            </div>

            {/* UPI ID */}
            <div className="w-full flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
              <span className="flex-1 text-sm font-mono font-semibold text-primary truncate">
                {UPI_ID}
              </span>
              <button
                type="button"
                onClick={handleCopyUPI}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            After payment, enter the amount above and click{" "}
            <span className="font-semibold text-primary">Add Funds</span> to
            update your balance.
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={handleDeposit}
            disabled={deposit.isPending || !amount}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {deposit.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              "Add Funds"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Dashboard() {
  const { data: balance = 0, isLoading: balanceLoading } = useGetBalance();
  const { data: orders = [], isLoading: ordersLoading } = useGetMyOrders();
  const { data: categories = [] } = useGetCategories();
  const { data: userProfile } = useGetCallerUserProfile();

  const recentOrders = [...orders].reverse().slice(0, 8);
  const pendingCount = orders.filter(
    (o) => o.status === OrderStatus.pending,
  ).length;
  const completedCount = orders.filter(
    (o) => o.status === OrderStatus.completed,
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-xl overflow-hidden h-36 sm:h-44">
        <img
          src="/assets/generated/dashboard-banner.dim_1200x300.png"
          alt="Dashboard Banner"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60 flex items-center px-6 sm:px-8">
          <div>
            <h2 className="text-white text-xl sm:text-2xl font-bold mb-1">
              Welcome back, {userProfile?.name || "User"}! 👋
            </h2>
            <p className="text-white/80 text-sm">
              Manage your social media growth campaigns from one place.
            </p>
          </div>
          <Link to="/new-order" className="ml-auto hidden sm:block">
            <Button className="bg-white text-primary hover:bg-white/90 font-semibold gap-2 shadow-purple-sm">
              <Zap size={16} />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance */}
        <Card className="col-span-2 lg:col-span-1 border-border shadow-xs hover:shadow-purple-sm transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet size={20} className="text-primary" />
              </div>
              <DepositDialog />
            </div>
            {balanceLoading ? (
              <Skeleton className="h-8 w-24 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-foreground">
                ${balance.toFixed(2)}
              </p>
            )}
            <p className="text-muted-foreground text-xs font-medium mt-0.5">
              Account Balance
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="border-border shadow-xs hover:shadow-purple-sm transition-shadow">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <ClipboardList size={20} className="text-primary" />
            </div>
            {ordersLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-foreground">
                {orders.length}
              </p>
            )}
            <p className="text-muted-foreground text-xs font-medium mt-0.5">
              Total Orders
            </p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="border-border shadow-xs hover:shadow-purple-sm transition-shadow">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            {ordersLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-foreground">
                {pendingCount}
              </p>
            )}
            <p className="text-muted-foreground text-xs font-medium mt-0.5">
              Pending
            </p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="border-border shadow-xs hover:shadow-purple-sm transition-shadow">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
              <ShoppingCart size={20} className="text-emerald-600" />
            </div>
            {ordersLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-foreground">
                {completedCount}
              </p>
            )}
            <p className="text-muted-foreground text-xs font-medium mt-0.5">
              Completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + Recent Orders */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <Link to="/new-order" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <ShoppingCart size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      Place New Order
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Start a new campaign
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-primary group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </Link>
              <Link to="/orders" className="block">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <ClipboardList size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      View All Orders
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {orders.length} total orders
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-muted-foreground group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Available Services */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Available Platforms</CardTitle>
              <CardDescription className="text-xs">
                {categories.length} platforms available
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {categories.length === 0 ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                  <AlertCircle size={14} />
                  <span>No platforms loaded yet</span>
                </div>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id.toString()}
                    className="flex items-center gap-2 py-1.5"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {cat.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {cat.description}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="lg:col-span-2 border-border shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <CardDescription className="text-xs">
                Your latest {recentOrders.length} orders
              </CardDescription>
            </div>
            <Link to="/orders">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary hover:bg-primary/5 gap-1 text-xs"
              >
                View All <ArrowRight size={12} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <ClipboardList size={22} className="text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  No orders yet
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Place your first order to get started
                </p>
                <Link to="/new-order">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                  >
                    <Plus size={14} />
                    New Order
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-xs font-semibold text-muted-foreground w-16">
                        ID
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground">
                        Service
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground text-right">
                        Cost
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-muted-foreground text-right">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow
                        key={order.id.toString()}
                        className="border-border hover:bg-accent/50"
                      >
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          #{order.id.toString()}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-foreground">
                          Service #{order.serviceId.toString()}
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
      </div>
    </div>
  );
}
