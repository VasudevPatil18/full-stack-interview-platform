import { useEffect, useState } from "react";
import { Link } from "react-router";
import { adminApi } from "../api/admin";
import Navbar from "../components/Navbar";
import {
  UsersIcon,
  VideoIcon,
  CheckCircle2Icon,
  TrendingUpIcon,
  ActivityIcon,
  BarChart3Icon,
} from "lucide-react";
import toast from "react-hot-toast";

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data.stats);
    } catch (error) {
      toast.error("Failed to load stats");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-base-content/60">Manage users, sessions, and view analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-primary">
                <UsersIcon className="size-8" />
              </div>
              <div className="stat-title">Total Users</div>
              <div className="stat-value text-primary">{stats?.totalUsers || 0}</div>
              <div className="stat-desc">{stats?.activeUsers || 0} active</div>
            </div>
          </div>

          {/* Total Sessions */}
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <VideoIcon className="size-8" />
              </div>
              <div className="stat-title">Total Sessions</div>
              <div className="stat-value text-secondary">{stats?.totalSessions || 0}</div>
              <div className="stat-desc">{stats?.activeSessions || 0} active now</div>
            </div>
          </div>

          {/* Completed Sessions */}
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-success">
                <CheckCircle2Icon className="size-8" />
              </div>
              <div className="stat-title">Completed</div>
              <div className="stat-value text-success">{stats?.completedSessions || 0}</div>
              <div className="stat-desc">All time</div>
            </div>
          </div>

          {/* New Users This Week */}
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-accent">
                <TrendingUpIcon className="size-8" />
              </div>
              <div className="stat-title">New This Week</div>
              <div className="stat-value text-accent">{stats?.newUsersThisWeek || 0}</div>
              <div className="stat-desc">Last 7 days</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/admin/users"
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UsersIcon className="size-6 text-primary" />
                </div>
                <div>
                  <h3 className="card-title text-lg">User Management</h3>
                  <p className="text-sm text-base-content/60">View and manage all users</p>
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/sessions"
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <ActivityIcon className="size-6 text-secondary" />
                </div>
                <div>
                  <h3 className="card-title text-lg">Session Management</h3>
                  <p className="text-sm text-base-content/60">Monitor all sessions</p>
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <BarChart3Icon className="size-6 text-accent" />
                </div>
                <div>
                  <h3 className="card-title text-lg">Analytics</h3>
                  <p className="text-sm text-base-content/60">View detailed analytics</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Sessions by Difficulty */}
        {stats?.sessionsByDifficulty && stats.sessionsByDifficulty.length > 0 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Sessions by Difficulty</h2>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {stats.sessionsByDifficulty.map((item) => (
                  <div key={item._id} className="stat bg-base-200 rounded-lg">
                    <div className="stat-title capitalize">{item._id}</div>
                    <div className="stat-value text-2xl">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
