import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "@/lib/auth";

export default function ProtectedRoute() {
  const loc = useLocation();
  const { session, loading } = useSession();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!session) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <Outlet />;
}
