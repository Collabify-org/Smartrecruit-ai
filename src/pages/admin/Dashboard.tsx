import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") !== "true") {
      navigate("/admin/login");
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (!error) setUsers(data.users);
    setLoading(false);
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setDeleting(id);
    await supabase.auth.admin.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleting(null);
  };

  const logout = () => {
    sessionStorage.removeItem("admin_auth");
    navigate("/admin/login");
  };

  const now = new Date();
  const today = users.filter((u) => {
    const d = new Date(u.last_sign_in_at);
    return d.toDateString() === now.toDateString();
  });
  const thisWeek = users.filter((u) => {
    const d = new Date(u.created_at);
    return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7;
  });

  const filtered = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm">
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Total Users</p>
          <p className="text-4xl font-bold mt-1">{users.length}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Active Today</p>
          <p className="text-4xl font-bold mt-1 text-green-400">{today.length}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5">
          <p className="text-gray-400 text-sm">New This Week</p>
          <p className="text-4xl font-bold mt-1 text-blue-400">{thisWeek.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">All Users ({filtered.length})</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700 text-left">
                <th className="py-3">Email</th>
                <th className="py-3">Plan</th>
                <th className="py-3">Created</th>
                <th className="py-3">Last Sign In</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-3">{user.email}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-900 text-blue-300">
                      {user.user_metadata?.plan || "Free"}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="py-3 text-gray-400">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never"}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => deleteUser(user.id)}
                      disabled={deleting === user.id}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs disabled:opacity-50"
                    >
                      {deleting === user.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
