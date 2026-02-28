import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingCart,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetBalance, useGetCallerUserProfile } from "../hooks/useQueries";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/new-order", label: "New Order", icon: ShoppingCart },
  { path: "/orders", label: "My Orders", icon: ClipboardList },
];

export default function Layout({ children }: LayoutProps) {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: balance = 0 } = useGetBalance();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const userName = userProfile?.name || "User";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyUp={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          bg-primary text-primary-foreground
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src="/assets/generated/smm-logo.dim_128x128.png"
              alt="SMM Panel"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).parentElement!.innerHTML =
                  '<span class="text-white font-bold text-sm">S</span>';
              }}
            />
          </div>
          <div>
            <h1 className="font-bold text-base text-white leading-tight">
              SMM Panel
            </h1>
            <p className="text-white/60 text-xs">Pro Dashboard</p>
          </div>
          <button
            type="button"
            className="ml-auto lg:hidden text-white/70 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Balance Card */}
        <div className="mx-4 mt-4 rounded-xl bg-white/10 border border-white/15 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={14} className="text-white/70" />
            <span className="text-white/70 text-xs font-medium uppercase tracking-wide">
              Balance
            </span>
          </div>
          <p className="text-white font-bold text-xl">${balance.toFixed(2)}</p>
          <p className="text-white/50 text-xs mt-0.5">Available funds</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest px-3 mb-3">
            Menu
          </p>
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = currentPath === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 group
                  ${
                    isActive
                      ? "bg-white text-primary shadow-purple-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <Icon
                  size={18}
                  className={
                    isActive
                      ? "text-primary"
                      : "text-white/70 group-hover:text-white"
                  }
                />
                <span>{label}</span>
                {isActive && (
                  <ChevronRight size={14} className="ml-auto text-primary/60" />
                )}
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-white/10 mx-4" />

        {/* User section */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-9 h-9 border-2 border-white/20">
              <AvatarFallback className="bg-white/20 text-white text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {userName}
              </p>
              <p className="text-white/50 text-xs truncate">
                {identity?.getPrincipal().toString().slice(0, 12)}...
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 gap-2"
          >
            <LogOut size={15} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-10 bg-card border-b border-border px-4 lg:px-6 py-3 flex items-center gap-4">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-accent text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <Zap size={16} className="text-primary" />
            <span className="font-semibold text-foreground text-sm hidden sm:block">
              {navItems.find((n) => n.path === currentPath)?.label ||
                "SMM Panel"}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Badge
              variant="secondary"
              className="hidden sm:flex gap-1.5 bg-secondary text-secondary-foreground border-0"
            >
              <Wallet size={12} />${balance.toFixed(2)}
            </Badge>
            <Avatar className="w-8 h-8 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
