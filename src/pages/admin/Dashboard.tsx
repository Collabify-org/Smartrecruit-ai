import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const PLANS = ["trial", "starter", "professional", "enterprise"];

const planColors: Record<string, string> = {
  trial: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  starter: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  professional: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  enterprise: "bg-green-500/20 text-green-400 border border-green-500/30",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [authUsers, setAuthUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") !== "true") {
      navigate("/admin/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    const [{ data: profileData }, { data: authData }] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.auth.admin.listUsers(),
    ]);
    setProfiles(profileData || []);
    setAuthUsers(authData?.users || []);
    setLoading(false);
  };

  const updatePlan = async (userId: string, newPlan: string) => {
    setUpdatingPlan(userId);
    const limits: Record<string, number> = {
      trial: 10,
      starter: 10,
      professional: 50,
      enterprise: 999999,
    };
    const limit = limits[newPlan] || 10;
    const trial_expires_at =
      newPlan === "trial"
        ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        : null;

    await supabase
      .from("profiles")
      .update({
        plan: newPlan,
        jd_limit: limit,
        talent_limit: limit,
        interview_limit: limit,
        trial_expires_at,
      })
      .eq("id", userId);

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === userId
          ? { ...p, plan: newPlan, jd_limit: limit, talent_limit: limit, interview_limit: limit, trial_expires_at }
          : p
      )
    );
    setUpdatingPlan(null);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Delete this user permanently?")) return;
    setDeleting(userId);
    await supabase.auth.admin.deleteUser(userId);
    await supabase.from("profiles").delete().eq("id", userId);
    setProfiles((prev) => prev.filter((p) => p.id !== userId));
    setAuthUsers((prev) => prev.filter((u) => u.id !== userId));
    setDeleting(null);
  };

  const merged = profiles
    .map((p) => {
      const auth = authUsers.find((u) => u.id === p.id);
      return { ...p, email: p.email || auth?.email, last_sign_in: auth?.last_sign_in_at };
    })
    .filter((u) => u.email?.toLowerCase().includes(search.toLowerCase()));

  const now = new Date();
  const totalUsers = profiles.length;
  const trialUsers = profiles.filter((p) => p.plan === "trial").length;
  const paidUsers = profiles.filter((p) => ["starter", "professional", "enterprise"].includes(p.plan)).length;
  const activeToday = authUsers.filter((u) => {
    if (!u.last_sign_in_at) return false;
    return new Date(u.last_sign_in_at).toDateString() === now.toDateString();
  }).length;

  const UsageBar = ({ used, limit, label }: { used: number; limit: number; label: string }) => {
    const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
    const color = pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-yellow-500" : "bg-blue-500";
    return (
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{label}</span>
          <span>{limit >= 999999 ? `${used} / ∞` : `${used} / ${limit}`}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div className={`${color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-56 bg-[#1a1a24] border-r border-white/10 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold">S</div>
          <span className="font-semibold text-sm">Synlumex Admin</span>
        </div>
        <nav className="space-y-1 flex-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-600/20 text-indigo-400 text-sm font-medium">
            <span>👥</span> Users
          </div>
        </nav>
        <button
          onClick={() => { sessionStorage.removeItem("admin_auth"); navigate("/admin/login"); }}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors"
        >
          <span>→</span> Logout
        </button>
      </div>

      {/* Main content */}
      <div className="ml-56 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your users and their plans</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: totalUsers, color: "text-white" },
            { label: "Active Today", value: activeToday, color: "text-green-400" },
            { label: "On Trial", value: trialUsers, color: "text-yellow-400" },
            { label: "Paid Users", value: paidUsers, color: "text-indigo-400" },
          ].map((s) => (
            <div key={s.label} className="bg-[#1a1a24] border border-white/10 rounded-xl p-5">
              <p className="text-gray-500 text-xs uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 py-2 rounded-lg bg-[#1a1a24] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Table */}
        <div className="bg-[#1a1a24] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left px-6 py-4">User</th>
                <th className="text-left px-6 py-4">Plan</th>
                <th className="text-left px-6 py-4">Trial Expires</th>
                <th className="text-left px-6 py-4">Last Sign In</th>
                <th className="text-left px-6 py-4">Usage</th>
                <th className="text-left px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">Loading...</td></tr>
              ) : merged.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">No users found</td></tr>
              ) : (
                merged.map((user) => (
                  <>
                    <tr
                      key={user.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-xs font-bold text-indigo-400">
                            {user.email?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">{user.email}</p>
                            {user.company_name && <p className="text-xs text-gray-500">{user.company_name}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${planColors[user.plan] || "bg-gray-500/20 text-gray-400"}`}>
                          {user.plan || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {user.trial_expires_at
                          ? new Date(user.trial_expires_at) < now
                            ? <span className="text-red-400">Expired</span>
                            : new Date(user.trial_expires_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : "Never"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <UsageBar used={user.usage_jd || 0} limit={user.jd_limit || 10} label="JDs" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={user.plan || "trial"}
                            onChange={(e) => updatePlan(user.id, e.target.value)}
                            disabled={updatingPlan === user.id}
                            className="bg-[#0f0f13] border border-white/10 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                          >
                            {PLANS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                          </select>
                          <button
                            onClick={() => deleteUser(user.id)}
                            disabled={deleting === user.id}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors text-xs"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedUser === user.id && (
                      <tr key={`${user.id}-expanded`} className="bg-white/5 border-b border-white/5">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-3 gap-6">
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-3">Usage Details</p>
                              <UsageBar used={user.usage_jd || 0} limit={user.jd_limit || 10} label="JD Generations" />
                              <UsageBar used={user.usage_talent || 0} limit={user.talent_limit || 10} label="Talent Analyses" />
                              <UsageBar used={user.usage_interview || 0} limit={user.interview_limit || 10} label="Interview Questions" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-3">Account Info</p>
                              <p className="text-xs text-gray-400 mb-1">Full name: <span className="text-white">{user.full_name || "—"}</span></p>
                              <p className="text-xs text-gray-400 mb-1">Company: <span className="text-white">{user.company_name || "—"}</span></p>
                              <p className="text-xs text-gray-400 mb-1">Created: <span className="text-white">{new Date(user.created_at).toLocaleDateString()}</span></p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-3">Billing</p>
                              <p className="text-xs text-gray-400 mb-1">Plan: <span className="text-white capitalize">{user.plan}</span></p>
                              <p className="text-xs text-gray-400 mb-1">Billing date: <span className="text-white">{user.billing_date ? new Date(user.billing_date).toLocaleDateString() : "—"}</span></p>
                              <p className="text-xs text-gray-400 mb-1">Trial expires: <span className="text-white">{user.trial_expires_at ? new Date(user.trial_expires_at).toLocaleDateString() : "—"}</span></p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
