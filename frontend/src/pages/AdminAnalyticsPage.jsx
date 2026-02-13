import { useEffect, useState } from "react";
import { adminApi } from "../api/admin";
import Navbar from "../components/Navbar";
import { BarChart3Icon, TrendingUpIcon, PieChartIcon, ActivityIcon } from "lucide-react";
import toast from "react-hot-toast";

function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await adminApi.getAnalytics();
      setAnalytics(data.analytics);
    } catch (error) {
      toast.error("Failed to load analytics");
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
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-base-content/60">Detailed insights and trends</p>
        </div>

        {/* Completion Rate */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-success">
                <ActivityIcon className="size-8" />
              </div>
              <div className="stat-title">Completion Rate</div>
              <div className="stat-value text-success">{analytics?.completionRate}%</div>
              <div className="stat-desc">Sessions completed successfully</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Trend */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <TrendingUpIcon className="size-5 text-primary" />
                User Registration Trend (Last 30 Days)
              </h2>
              <div className="mt-4">
                {analytics?.userTrend && analytics.userTrend.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.userTrend.map((item) => (
                      <div key={item._id} className="flex items-center gap-4">
                        <div className="text-sm text-base-content/60 w-24">{item._id}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <progress
                              className="progress progress-primary w-full"
                              value={item.count}
                              max={Math.max(...analytics.userTrend.map((t) => t.count))}
                            ></progress>
                            <span className="text-sm font-semibold">{item.count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-base-content/60 py-8">No data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Sessions by Difficulty */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <PieChartIcon className="size-5 text-secondary" />
                Sessions by Difficulty
              </h2>
              <div className="mt-4">
                {analytics?.sessionsByDifficulty && analytics.sessionsByDifficulty.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.sessionsByDifficulty.map((item) => {
                      const total = analytics.sessionsByDifficulty.reduce(
                        (sum, i) => sum + i.count,
                        0
                      );
                      const percentage = ((item.count / total) * 100).toFixed(1);
                      
                      return (
                        <div key={item._id}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-semibold capitalize">{item._id}</span>
                            <span className="text-sm text-base-content/60">
                              {item.count} ({percentage}%)
                            </span>
                          </div>
                          <progress
                            className={`progress ${
                              item._id === "easy"
                                ? "progress-success"
                                : item._id === "medium"
                                ? "progress-warning"
                                : "progress-error"
                            } w-full`}
                            value={item.count}
                            max={total}
                          ></progress>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-base-content/60 py-8">No data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Popular Problems */}
          <div className="card bg-base-100 shadow-xl lg:col-span-2">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2">
                <BarChart3Icon className="size-5 text-accent" />
                Top 10 Popular Problems
              </h2>
              <div className="mt-4">
                {analytics?.popularProblems && analytics.popularProblems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Problem</th>
                          <th>Sessions</th>
                          <th>Popularity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.popularProblems.map((problem, index) => {
                          const maxCount = analytics.popularProblems[0].count;
                          const percentage = ((problem.count / maxCount) * 100).toFixed(0);
                          
                          return (
                            <tr key={problem._id}>
                              <td>{index + 1}</td>
                              <td className="font-semibold">{problem._id}</td>
                              <td>{problem.count}</td>
                              <td>
                                <div className="flex items-center gap-2">
                                  <progress
                                    className="progress progress-accent w-32"
                                    value={problem.count}
                                    max={maxCount}
                                  ></progress>
                                  <span className="text-xs text-base-content/60">
                                    {percentage}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-base-content/60 py-8">No data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalyticsPage;
