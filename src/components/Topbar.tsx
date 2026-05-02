import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Settings as SettingsIcon, CreditCard, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getUser, signOut } from "@/lib/auth";

export default function Topbar({ onMenu }: { onMenu?: () => void }) {
  const navigate = useNavigate();
  const [user] = useState(getUser());
  const initials = (user?.name || "U").slice(0, 2).toUpperCase();
  return (
    <header className="sticky top-0 z-20 h-14 border-b border-border bg-background/70 backdrop-blur-xl flex items-center gap-3 px-4 lg:px-8">
      <div className="flex-1 max-w-md hidden md:flex items-center gap-2 px-3 h-9 rounded-lg border border-border bg-secondary/50">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input className="border-0 bg-transparent h-8 px-0 focus-visible:ring-0" placeholder="Search…" />
        <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">⌘K</kbd>
      </div>
      <div className="flex-1 md:hidden" />
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
          <DropdownMenuItem onClick={() => navigate("/app/settings")}><SettingsIcon className="h-4 w-4 mr-2" />Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/app/billing")}><CreditCard className="h-4 w-4 mr-2" />Billing</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { signOut(); navigate("/login"); }}>
            <LogOut className="h-4 w-4 mr-2" />Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
