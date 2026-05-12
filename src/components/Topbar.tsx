import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Button,
} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  Settings as SettingsIcon,
  CreditCard,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { getUser, signOut } from "@/lib/auth";

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(getUser());

  const initials = (user?.name || "U").slice(0, 2).toUpperCase();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8 border-b transition-all duration-300 ${
        scrolled
          ? "h-12 bg-white/10 backdrop-blur-3xl border-white/10 shadow-lg"
          : "h-14 bg-background/70 backdrop-blur-xl border-border"
      }`}
    >

      {/* LEFT - LOGO MORPH */}
      <div className="flex items-center min-w-[140px] relative">

        {/* FULL LOGO */}
        <img
          src="/synlumex-logo.png.png"
          alt="Synlumex"
          onClick={() => navigate("/")}
          className={`cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${
            scrolled ? "opacity-0 scale-90 w-0" : "opacity-100 h-14"
          }`}
        />

        {/* ICON LOGO */}
        <img
          src="/synlumex-logo.png.png"
          alt="Synlumex"
          onClick={() => navigate("/")}
          className={`absolute left-0 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${
            scrolled ? "opacity-100 h-14" : "opacity-0 scale-90 w-0"
          } drop-shadow-[0_0_14px_rgba(99,102,241,0.35)]`}
        />

      </div>

      {/* CENTER NAV */}
      <div className="hidden md:flex items-center gap-7 text-sm font-medium">

        <button
          onClick={() => navigate("/app")}
          className={`relative pb-1 transition ${
            isActive("/app") ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Home
          {isActive("/app") && (
            <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => navigate("/app/jd")}
          className={`relative pb-1 transition ${
            isActive("/app/jd") ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          JD
          {isActive("/app/jd") && (
            <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => navigate("/app/talent")}
          className={`relative pb-1 transition ${
            isActive("/app/talent") ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Talent
          {isActive("/app/talent") && (
            <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
          )}
        </button>

      </div>

      {/* SEARCH */}
      <div className="flex-1 max-w-md hidden md:flex items-center gap-2 px-3 h-9 rounded-lg border border-border bg-secondary/50">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          className="border-0 bg-transparent h-8 px-0 focus-visible:ring-0"
          placeholder="Search…"
        />
        <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
          ⌘K
        </kbd>
      </div>

      {/* USER */}
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-2 gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-brand text-brand-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">
                {user?.name}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm">{user?.name}</div>
              <div className="text-xs text-muted-foreground font-normal">
                {user?.email}
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate("/app/settings")}>
              <SettingsIcon className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate("/app/billing")}>
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={async () => {
                await signOut();
                navigate("/login");
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    </header>
  );
}
