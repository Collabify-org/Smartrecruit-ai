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

  const logout = () => {
    sessionStorage.removeItem("admin_auth");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
          Logout
        </button>
      </div>
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">All Users ({users.length})</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2">Email</th>
                <th className="text-left py-2">Created</th>
                <th className="text-left py-2">Last Sign In</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="py-2">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
