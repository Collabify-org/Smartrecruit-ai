import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { signIn } from "@/lib/auth";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Enter email and password");
    signIn(email);
    toast.success("Welcome back");
    navigate("/app/jd-generator");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-brand text-brand-foreground">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-semibold">HireFlow AI</span>
        </Link>
        <div>
          <h2 className="text-3xl font-semibold leading-tight max-w-sm">"HireFlow cut our JD time from 2 hours to 2 minutes."</h2>
          <p className="mt-3 opacity-80 text-sm">— Head of Talent, Series B Startup</p>
        </div>
        <div className="text-xs opacity-70">© {new Date().getFullYear()} HireFlow AI</div>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5 animate-fade-in">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Log in to your HireFlow workspace.</p>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full bg-gradient-brand text-brand-foreground shadow-glow">Log in</Button>
          <div className="text-sm text-muted-foreground text-center">
            No account? <Link to="/signup" className="text-foreground font-medium hover:underline">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
