import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings as SettingsIcon, CreditCard } from "lucide-react";
import { getUser, signOut } from "@/lib/auth";

export default function Topbar() {
  const navigate = useNavigate();
  const [user] = useState(getUser());
  const initials = (user?.name || "U").slice(0, 2).toUpperCase();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8 border-b transition-all duration-300 ${
      scrolled ? "h-12 bg-white/10 backdrop-blur-3xl border-white/10 shadow-lg" : "h-14 bg-background/70 backdrop-blur-xl border-border"
    }`}>
      <div className="flex items-center min-w-[140px] relative">
        <img src="/synlumex-logo.png.png" alt="Synlumex" onClick={() => navigate("/")}
          className={`cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${scrolled ? "opacity-0 scale-90 w-0" : "opacity-100 h-14"}`}
        />
        <img src="/synlumex-logo.png.png" alt="Synlumex" onClick={() => navigate("/")}
          className={`absolute left-0 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${scrolled ? "opacity-100 h-14" : "opacity-0 scale-90 w-0"} drop-shadow-[0_0_14px_rgba(99,102,241,0.35)]`}
        />
      </div>
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 px-2 gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-brand text-brand-foreground text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm">{user?.name}</div>
              <div className="text-xs text-muted-foreground font-normal">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/app/settings")}>
              <SettingsIcon className="h-4 w-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/app/billing")}>
              <CreditCard className="h-4 w-4 mr-2" /> Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => { await signOut(); navigate("/login"); }}>
              <LogOut className="h-4 w-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
