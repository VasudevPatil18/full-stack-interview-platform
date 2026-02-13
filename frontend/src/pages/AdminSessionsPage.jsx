import { useEffect, useState } from "react";
import { adminApi } from "../api/admin";
import Navbar from "../components/Navbar";
import { Link } from "react-router";
import { ExternalLinkIcon, PhoneOffIcon, VideoIcon } from "lucide-react";
import toast from "react-hot-toast";
import { getDifficultyBadgeClass } from "../lib/utils";

function AdminSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSessions();
  }, [page, statusFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSessions({ page, limit: 10, status: statusFilter });
      setSessions(data.sessions);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (sessionId) => {
    if (!confirm("Are you sure you want to end this session?")) return;

    try {
      await adminApi.forceEndSession(sessionId);
      toast.success("Session ended successfully");
      fetchSessions();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to end session");
    }
  };

  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
            Session Management
          </h1>
          <p className="text-base-content/60">Monitor and manage all coding sessions</p>
        </div>

        {/* Filters */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex gap-4">
              <select
                className="select select-bordered"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sessions Table */}
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
                        <th>Problem</th>
                        <th>Difficulty</th>
                        <th>Host</th>
                        <th>Participant</th>
                        <th>Status</th>
                        <th>Meeting Code</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session) => (
                        <tr key={session._id}>
                          <td className="font-semibold">{session.problem}</td>
                          <td>
                            <span className={`badge ${getDifficultyBadgeClass(session.difficulty)}`}>
                              {session.difficulty}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="avatar placeholder">
                                <div className="bg-primary/10 text-primary rounded-full w-8">
                                  <span className="text-xs">
                                    {session.host?.name?.charAt(0) || "?"}
                                  </span>
                                </div>
                              </div>
                              <span className="text-sm">{session.host?.name || "Unknown"}</span>
                            </div>
                          </td>
                          <td>
                            {session.participant ? (
                              <div className="flex items-center gap-2">
                                <div className="avatar placeholder">
                                  <div className="bg-secondary/10 text-secondary rounded-full w-8">
                                    <span className="text-xs">
                                      {session.participant?.name?.charAt(0) || "?"}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-sm">{session.participant?.name}</span>
                              </div>
                            ) : (
                              <span className="text-base-content/40 text-sm">Waiting...</span>
                            )}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                session.status === "active" ? "badge-success" : "badge-ghost"
                              }`}
                            >
                              {session.status}
                            </span>
                          </td>
                          <td>
                            <code className="text-xs bg-base-200 px-2 py-1 rounded">
                              {session.meetingCode || "N/A"}
                            </code>
                          </td>
                          <td className="text-sm">
                            {new Date(session.createdAt).toLocaleString()}
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <Link
                                to={`/session/${session._id}`}
                                className="btn btn-ghost btn-xs"
                                title="View Session"
                              >
                                <ExternalLinkIcon className="size-4" />
                              </Link>
                              {session.status === "active" && (
                                <button
                                  onClick={() => handleEndSession(session._id)}
                                  className="btn btn-ghost btn-xs text-error"
                                  title="End Session"
                                >
                                  <PhoneOffIcon className="size-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {sessions.length === 0 && (
                  <div className="text-center py-8 text-base-content/60">
                    <VideoIcon className="size-12 mx-auto mb-2 opacity-50" />
                    <p>No sessions found</p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
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
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSessionsPage;
