import { Button } from "@/components/ui/button";
import { BarChart3, Shield, TrendingUp, Users, Zap } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  {
    icon: TrendingUp,
    title: "Grow Your Audience",
    desc: "Boost followers across all major platforms",
  },
  {
    icon: Users,
    title: "Multi-Platform",
    desc: "Telegram, Instagram, YouTube & more",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    desc: "Track your orders and campaign performance",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    desc: "Powered by Internet Computer blockchain",
  },
];

export default function LoginPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center overflow-hidden">
              <img
                src="/assets/generated/smm-logo.dim_128x128.png"
                alt="SMM Panel"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <span className="text-white font-bold text-xl">SMM Panel Pro</span>
          </div>

          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Supercharge Your
            <br />
            Social Media Growth
          </h2>
          <p className="text-white/70 text-lg mb-12">
            Professional SMM services for Telegram, Instagram, YouTube and more.
            Fast, reliable, and affordable.
          </p>

          <div className="space-y-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-white/60 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/40 text-xs">
          © {new Date().getFullYear()} SMM Panel Pro. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap size={20} className="text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              SMM Panel Pro
            </span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in to access your SMM dashboard and manage your orders.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-purple-sm">
            <div className="flex items-center gap-3 mb-6 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <Shield size={18} className="text-primary flex-shrink-0" />
              <p className="text-sm text-foreground/80">
                Secured with{" "}
                <span className="font-semibold text-primary">
                  Internet Identity
                </span>{" "}
                — no passwords needed.
              </p>
            </div>

            <Button
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield size={16} />
                  Sign In with Internet Identity
                </span>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              New users will be prompted to create a profile after signing in.
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
