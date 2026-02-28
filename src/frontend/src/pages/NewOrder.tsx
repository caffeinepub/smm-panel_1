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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Hash,
  Info,
  Link2,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { SmmService } from "../backend";
import {
  useGetBalance,
  useGetCategories,
  useGetServicesByCategory,
  usePlaceOrder,
} from "../hooks/useQueries";

function getPlatformEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.startsWith("instagram")) return "📸";
  if (lower.startsWith("telegram")) return "✈️";
  if (lower.startsWith("youtube")) return "▶️";
  if (lower.startsWith("facebook")) return "👍";
  if (lower.startsWith("twitter") || lower.startsWith("x ") || lower === "x")
    return "🐦";
  if (lower.startsWith("tiktok")) return "🎵";
  return "🌐";
}

function ServiceInfoCard({ service }: { service: SmmService }) {
  return (
    <Card className="border-primary/20 bg-primary/5 shadow-xs">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Info size={16} className="text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">
              {service.name}
            </h4>
            <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
              {service.description}
            </p>
          </div>
        </div>
        <Separator className="my-3 bg-primary/10" />
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-white border border-primary/10">
            <p className="text-xs text-muted-foreground mb-0.5">Min Qty</p>
            <p className="font-bold text-sm text-foreground">
              {service.minQuantity.toString()}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white border border-primary/10">
            <p className="text-xs text-muted-foreground mb-0.5">Max Qty</p>
            <p className="font-bold text-sm text-foreground">
              {service.maxQuantity.toString()}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-primary border border-primary">
            <p className="text-xs text-primary-foreground/70 mb-0.5">
              Per Unit
            </p>
            <p className="font-bold text-sm text-primary-foreground">
              ${service.pricePerUnit.toFixed(3)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NewOrder() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<bigint | null>(
    null,
  );
  const [selectedService, setSelectedService] = useState<SmmService | null>(
    null,
  );
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  const { data: categories = [], isLoading: categoriesLoading } =
    useGetCategories();
  const { data: services = [], isLoading: servicesLoading } =
    useGetServicesByCategory(selectedCategoryId);
  const { data: balance = 0 } = useGetBalance();
  const placeOrder = usePlaceOrder();

  const quantityNum = Number.parseInt(quantity, 10);
  const isValidQuantity =
    selectedService !== null &&
    !Number.isNaN(quantityNum) &&
    quantityNum >= Number(selectedService.minQuantity) &&
    quantityNum <= Number(selectedService.maxQuantity);

  const isValidLink = link.trim().length > 0;
  const totalCost =
    selectedService && isValidQuantity
      ? selectedService.pricePerUnit * quantityNum
      : 0;

  const hasEnoughBalance = totalCost <= balance;
  const canSubmit =
    selectedService !== null &&
    isValidLink &&
    isValidQuantity &&
    hasEnoughBalance;

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(BigInt(value));
    setSelectedService(null);
    setQuantity("");
  };

  const handleServiceChange = (value: string) => {
    const svc = services.find((s) => s.id.toString() === value) || null;
    setSelectedService(svc);
    setQuantity("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !canSubmit) return;

    try {
      await placeOrder.mutateAsync({
        serviceId: selectedService.id,
        link: link.trim(),
        quantity: BigInt(quantityNum),
      });
      setOrderSuccess(true);
      toast.success("Order placed successfully!");
      // Reset form
      setLink("");
      setQuantity("");
      setSelectedService(null);
      setSelectedCategoryId(null);
      setTimeout(() => setOrderSuccess(false), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      if (msg.includes("Insufficient")) {
        toast.error("Insufficient balance. Please add funds to your account.");
      } else if (msg.includes("Quantity")) {
        toast.error(msg);
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShoppingCart size={22} className="text-primary" />
          New Order
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Select a service and fill in the details to place your order.
        </p>
      </div>

      {/* Success Banner */}
      {orderSuccess && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2
              size={20}
              className="text-emerald-600 flex-shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Order Placed Successfully!
              </p>
              <p className="text-xs text-emerald-600">
                Your order is now pending. Check the Orders page for updates.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Balance Warning */}
      {balance < 1 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Your balance is low.{" "}
              <span className="font-semibold">Add funds</span> from the
              Dashboard to place orders.
            </p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Category */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                1
              </span>
              Select Platform
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Platform / Category
              </Label>
              {categoriesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  onValueChange={handleCategoryChange}
                  value={selectedCategoryId?.toString() || ""}
                >
                  <SelectTrigger className="border-input focus:ring-primary">
                    <SelectValue placeholder="Choose a platform..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.id.toString()}
                        value={cat.id.toString()}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base leading-none">
                            {getPlatformEmoji(cat.name)}
                          </span>
                          <span>{cat.name}</span>
                          <span className="text-muted-foreground text-xs">
                            — {cat.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Service dropdown */}
            {selectedCategoryId !== null && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Service</Label>
                {servicesLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    onValueChange={handleServiceChange}
                    value={selectedService?.id.toString() || ""}
                  >
                    <SelectTrigger className="border-input focus:ring-primary">
                      <SelectValue placeholder="Choose a service..." />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((svc) => (
                        <SelectItem
                          key={svc.id.toString()}
                          value={svc.id.toString()}
                        >
                          <div className="flex items-center gap-2">
                            <Zap size={13} className="text-primary" />
                            <span>{svc.name}</span>
                            <Badge variant="secondary" className="text-xs ml-1">
                              ${svc.pricePerUnit.toFixed(3)}/unit
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Info */}
        {selectedService && <ServiceInfoCard service={selectedService} />}

        {/* Step 2: Order Details */}
        {selectedService && (
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Link */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="link"
                  className="flex items-center gap-1.5 text-sm"
                >
                  <Link2 size={13} className="text-primary" />
                  Target Link
                </Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="border-input focus-visible:ring-primary"
                />
                {link && !isValidLink && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle size={11} /> Please enter a valid URL
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="quantity"
                  className="flex items-center gap-1.5 text-sm"
                >
                  <Hash size={13} className="text-primary" />
                  Quantity
                  <span className="text-muted-foreground text-xs font-normal ml-1">
                    (min: {selectedService.minQuantity.toString()}, max:{" "}
                    {selectedService.maxQuantity.toString()})
                  </span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={Number(selectedService.minQuantity)}
                  max={Number(selectedService.maxQuantity)}
                  placeholder={`${selectedService.minQuantity.toString()} – ${selectedService.maxQuantity.toString()}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="border-input focus-visible:ring-primary"
                />
                {quantity && !isValidQuantity && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle size={11} />
                    Quantity must be between{" "}
                    {selectedService.minQuantity.toString()} and{" "}
                    {selectedService.maxQuantity.toString()}
                  </p>
                )}
              </div>

              {/* Cost Preview */}
              {isValidQuantity && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <DollarSign size={14} className="text-primary" />
                      Price per unit
                    </span>
                    <span className="text-sm font-medium">
                      ${selectedService.pricePerUnit.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Quantity
                    </span>
                    <span className="text-sm font-medium">
                      {quantityNum.toLocaleString()}
                    </span>
                  </div>
                  <Separator className="my-2 bg-primary/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      Total Cost
                    </span>
                    <span
                      className={`text-lg font-bold ${hasEnoughBalance ? "text-primary" : "text-destructive"}`}
                    >
                      ${totalCost.toFixed(2)}
                    </span>
                  </div>
                  {!hasEnoughBalance && (
                    <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                      <AlertCircle size={11} />
                      Insufficient balance. You need $
                      {(totalCost - balance).toFixed(2)} more.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        {selectedService && (
          <Button
            type="submit"
            disabled={!canSubmit || placeOrder.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 gap-2"
          >
            {placeOrder.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                Place Order {isValidQuantity && `— $${totalCost.toFixed(2)}`}
              </>
            )}
          </Button>
        )}
      </form>
    </div>
  );
}
