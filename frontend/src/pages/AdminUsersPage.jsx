import { useEffect, useState } from "react";
import { adminApi } from "../api/admin";
import Navbar from "../components/Navbar";
import { EditIcon, SearchIcon, TrashIcon, UserCheckIcon, UserXIcon } from "lucide-react";
import toast from "react-hot-toast";

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers({ page, limit: 10, search, role: roleFilter });
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await adminApi.updateUser(userId, updates);
      toast.success("User updated successfully");
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await adminApi.deleteUser(userId);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const toggleUserStatus = async (user) => {
    await handleUpdateUser(user._id, { isActive: !user.isActive });
  };

  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
            User Management
          </h1>
          <p className="text-base-content/60">Manage all users and their permissions</p>
        </div>

        {/* Filters */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex flex-wrap gap-4">
              <div className="form-control flex-1 min-w-[200px]">
                <div className="input-group">
                  <span>
                    <SearchIcon className="size-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    className="input input-bordered w-full"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>

              <select
                className="select select-bordered"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {loading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="avatar placeholder">
                                <div className="bg-primary/10 text-primary rounded-full w-10">
                                  <span className="text-sm">{user.name.charAt(0)}</span>
                                </div>
                              </div>
                              <div className="font-semibold">{user.name}</div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span
                              className={`badge ${
                                user.role === "admin" ? "badge-primary" : "badge-ghost"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                user.isActive ? "badge-success" : "badge-error"
                              }`}
                            >
                              {user.isActive ? "Active" : "Banned"}
                            </span>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingUser(user)}
                                className="btn btn-ghost btn-xs"
                                title="Edit"
                              >
                                <EditIcon className="size-4" />
                              </button>
                              <button
                                onClick={() => toggleUserStatus(user)}
                                className="btn btn-ghost btn-xs"
                                title={user.isActive ? "Ban User" : "Unban User"}
                              >
                                {user.isActive ? (
                                  <UserXIcon className="size-4 text-error" />
                                ) : (
                                  <UserCheckIcon className="size-4 text-success" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="btn btn-ghost btn-xs text-error"
                                title="Delete"
                              >
                                <TrashIcon className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-6">
                  <div className="join">
                    <button
                      className="join-item btn"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      «
                    </button>
                    <button className="join-item btn">
                      Page {page} of {totalPages}
                    </button>
                    <button
                      className="join-item btn"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      »
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Edit User</h3>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Role</span>
                </label>
                <select
                  className="select select-bordered"
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setEditingUser(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleUpdateUser(editingUser._id, editingUser)}
              >
                Save Changes
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setEditingUser(null)}></div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;
