import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const PLANS = ["trial", "starter", "professional", "enterprise"];

const planStyles: Record<string, string> = {
  trial: "bg-amber-50 text-amber-700 border border-amber-200",
  starter: "bg-blue-50 text-blue-700 border border-blue-200",
  professional: "bg-violet-50 text-violet-700 border border-violet-200",
  enterprise: "bg-emerald-50 text-emerald-700 border border-emerald-200",
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
    const profiles = profileData || [];
    const authUsers = authData?.users || [];
    // merge auth users that don't have a profile yet
    const profileIds = new Set(profiles.map((p: any) => p.id));
    const missingProfiles = authUsers
      .filter((u) => !profileIds.has(u.id))
      .map((u) => ({ id: u.id, email: u.email, plan: null, usage_jd: 0, usage_talent: 0, usage_interview: 0, jd_limit: 0, talent_limit: 0, interview_limit: 0 }));
    setProfiles([...profiles, ...missingProfiles]);
    setAuthUsers(authUsers);
    setLoading(false);
  };

  const updatePlan = async (userId: string, newPlan: string) => {
    setUpdatingPlan(userId);
    const limits: Record<string, number> = {
      trial: 10, starter: 10, professional: 50, enterprise: 999999,
    };
    const limit = limits[newPlan] || 10;
    const trial_expires_at = newPlan === "trial"
      ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      : null;
    await supabase.from("profiles").upsert({
      id: userId,
      plan: newPlan,
      jd_limit: limit,
      talent_limit: limit,
      interview_limit: limit,
      trial_expires_at,
    });
    setProfiles((prev) =>
      prev.map((p) => p.id === userId
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

  const now = new Date();

  const merged = profiles
    .map((p) => {
      const auth = authUsers.find((u) => u.id === p.id);
      return { ...p, email: p.email || auth?.email, last_sign_in: auth?.last_sign_in_at };
    })
    .filter((u) => u.email?.toLowerCase().includes(search.toLowerCase()));

  const totalUsers = profiles.length;
  const trialUsers = profiles.filter((p) => p.plan === "trial").length;
  const paidUsers = profiles.filter((p) => ["starter", "professional", "enterprise"].includes(p.plan)).length;
  const activeToday = authUsers.filter((u) => u.last_sign_in_at && new Date(u.last_sign_in_at).toDateString() === now.toDateString()).length;

  const UsageBar = ({ used, limit, label }: { used: number; limit: number; label: string }) => {
    const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
    const color = pct >= 90 ? "bg-red-400" : pct >= 60 ? "bg-amber-400" : "bg-violet-500";
    return (
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{label}</span>
          <span className="font-medium text-gray-700">{limit >= 999999 ? `${used} / ∞` : `${used} / ${limit}`}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-200 p-6 flex flex-col">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
          <span className="font-semibold text-gray-900 text-sm">Synlumex Admin</span>
        </div>
        <nav className="space-y-1 flex-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-violet-50 text-violet-700 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Users
          </div>
        </nav>
        <button
          onClick={() => { sessionStorage.removeItem("admin_auth"); navigate("/admin/login"); }}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Logout
        </button>
      </div>

      {/* Main */}
      <div className="ml-56 flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all your users and their plans</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: totalUsers, color: "text-gray-900", bg: "bg-white" },
            { label: "Active Today", value: activeToday, color: "text-emerald-600", bg: "bg-white" },
            { label: "On Trial", value: trialUsers, color: "text-amber-600", bg: "bg-white" },
            { label: "Paid Users", value: paidUsers, color: "text-violet-600", bg: "bg-white" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border border-gray-200 rounded-xl p-5 shadow-sm`}>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-bold mt-2 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative w-72">
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trial Expires</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Sign In</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">JD Usage</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : merged.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No users found</td></tr>
              ) : (
                merged.map((user) => (
                  <>
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {user.email?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.email}</p>
                            {user.company_name && <p className="text-xs text-gray-400">{user.company_name}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${planStyles[user.plan] || "bg-gray-100 text-gray-500"}`}>
                          {user.plan || "No plan"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.trial_expires_at
                          ? new Date(user.trial_expires_at) < now
                            ? <span className="text-red-500 text-xs font-medium">Expired</span>
                            : <span className="text-gray-600 text-xs">{new Date(user.trial_expires_at).toLocaleDateString()}</span>
                          : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : "Never"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-28">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>JDs</span>
                            <span>{user.jd_limit >= 999999 ? `${user.usage_jd || 0}/∞` : `${user.usage_jd || 0}/${user.jd_limit || 0}`}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${(user.usage_jd / user.jd_limit) >= 0.9 ? "bg-red-400" : "bg-violet-500"}`}
                              style={{ width: `${user.jd_limit > 0 ? Math.min((user.usage_jd / user.jd_limit) * 100, 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={user.plan || "trial"}
                            onChange={(e) => updatePlan(user.id, e.target.value)}
                            disabled={updatingPlan === user.id}
                            className="bg-white border border-gray-200 text-xs text-gray-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
                          >
                            {PLANS.map((p) => (
                              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => deleteUser(user.id)}
                            disabled={deleting === user.id}
                            className="p-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-red-500 transition-colors disabled:opacity-50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedUser === user.id && (
                      <tr key={`${user.id}-exp`} className="bg-violet-50/30">
                        <td colSpan={6} className="px-6 py-5">
                          <div className="grid grid-cols-3 gap-8">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Usage Details</p>
                              <UsageBar used={user.usage_jd || 0} limit={user.jd_limit || 0} label="JD Generations" />
                              <UsageBar used={user.usage_talent || 0} limit={user.talent_limit || 0} label="Talent Analyses" />
                              <UsageBar used={user.usage_interview || 0} limit={user.interview_limit || 0} label="Interview Questions" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Account Info</p>
                              <div className="space-y-2">
                                <p className="text-xs text-gray-500">Full name: <span className="text-gray-800 font-medium">{user.full_name || "—"}</span></p>
                                <p className="text-xs text-gray-500">Company: <span className="text-gray-800 font-medium">{user.company_name || "—"}</span></p>
                                <p className="text-xs text-gray-500">Created: <span className="text-gray-800 font-medium">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</span></p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Billing</p>
                              <div className="space-y-2">
                                <p className="text-xs text-gray-500">Plan: <span className="text-gray-800 font-medium capitalize">{user.plan || "—"}</span></p>
                                <p className="text-xs text-gray-500">Billing date: <span className="text-gray-800 font-medium">{user.billing_date ? new Date(user.billing_date).toLocaleDateString() : "—"}</span></p>
                                <p className="text-xs text-gray-500">Trial expires: <span className="text-gray-800 font-medium">{user.trial_expires_at ? new Date(user.trial_expires_at).toLocaleDateString() : "—"}</span></p>
                              </div>
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
