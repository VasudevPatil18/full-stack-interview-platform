import { useState, useEffect } from "react";
import { CalendarIcon, ClockIcon, PlusIcon, UserIcon, VideoIcon, XIcon, EditIcon, TrashIcon } from "lucide-react";
import Navbar from "../components/Navbar";
import ScheduleInterviewModal from "../components/ScheduleInterviewModal";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

function SchedulePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("all"); // all, interviewer, candidate
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    fetchInterviews();
    fetchUpcoming();
  }, [selectedRole]);

  const fetchInterviews = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (selectedRole !== "all") {
        params.role = selectedRole;
      }
      
      const response = await axios.get("/schedule", { params });
      setInterviews(response.data.interviews);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error("Failed to load interviews");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUpcoming = async () => {
    try {
      const response = await axios.get("/schedule/upcoming");
      setUpcomingInterviews(response.data.interviews);
    } catch (error) {
      console.error("Error fetching upcoming interviews:", error);
    }
  };

  const handleCancelInterview = async (id) => {
    if (!confirm("Are you sure you want to cancel this interview?")) return;

    try {
      await axios.delete(`/schedule/${id}`, {
        data: { reason: "Cancelled by user" }
      });
      toast.success("Interview cancelled successfully");
      fetchInterviews();
      fetchUpcoming();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel interview");
    }
  };

  const handleStartInterview = async (interview) => {
    try {
      await axios.post(`/schedule/${interview._id}/start`);
      navigate(`/session/${interview._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start interview");
    }
  };

  const getInterviewRole = (interview) => {
    if (interview.interviewer?._id === user?._id) return "interviewer";
    if (interview.candidate?._id === user?._id) return "candidate";
    return "unknown";
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "badge-success";
      case "medium": return "badge-warning";
      case "hard": return "badge-error";
      default: return "badge-ghost";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled": return "badge-info";
      case "active": return "badge-success";
      case "completed": return "badge-neutral";
      case "cancelled": return "badge-error";
      default: return "badge-ghost";
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canStartInterview = (interview) => {
    if (interview.status !== "scheduled") return false;
    
    const now = new Date();
    const scheduledTime = new Date(interview.scheduledStartTime);
    const fifteenMinutesBefore = new Date(scheduledTime.getTime() - 15 * 60000);
    
    return now >= fifteenMinutesBefore;
  };

  return (
    <>
      <div className="min-h-screen bg-base-300">
        <Navbar />

        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Interview Schedule
              </h1>
              <p className="text-base-content/60 mt-2">
                Manage your scheduled interviews
              </p>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="btn btn-primary gap-2"
            >
              <PlusIcon className="size-5" />
              Schedule Interview
            </button>
          </div>

          {/* Role Filter */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSelectedRole("all")}
              className={`btn btn-sm ${selectedRole === "all" ? "btn-primary" : "btn-ghost"}`}
            >
              All Interviews
            </button>
            <button
              onClick={() => setSelectedRole("interviewer")}
              className={`btn btn-sm ${selectedRole === "interviewer" ? "btn-primary" : "btn-ghost"}`}
            >
              As Interviewer
            </button>
            <button
              onClick={() => setSelectedRole("candidate")}
              className={`btn btn-sm ${selectedRole === "candidate" ? "btn-primary" : "btn-ghost"}`}
            >
              As Candidate
            </button>
          </div>

          {/* Upcoming Interviews */}
          {upcomingInterviews.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Upcoming This Week</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingInterviews.map((interview) => {
                  const role = getInterviewRole(interview);
                  const otherPerson = role === "interviewer" ? interview.candidate : interview.interviewer;
                  
                  return (
                    <div key={interview._id} className="card bg-base-100 shadow-lg border-2 border-primary/20">
                      <div className="card-body">
                        <div className="flex items-start justify-between">
                          <div className="badge badge-primary">{role}</div>
                          <div className={`badge ${getStatusColor(interview.status)}`}>
                            {interview.status}
                          </div>
                        </div>

                        <h3 className="card-title text-lg mt-2">
                          {interview.title || interview.problem}
                        </h3>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="size-4 text-primary" />
                            <span>{formatDateTime(interview.scheduledStartTime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="size-4 text-primary" />
                            <span>{interview.duration} minutes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserIcon className="size-4 text-primary" />
                            <span>{otherPerson?.name}</span>
                          </div>
                        </div>

                        <div className="card-actions justify-end mt-4">
                          {canStartInterview(interview) ? (
                            <button
                              onClick={() => handleStartInterview(interview)}
                              className="btn btn-success btn-sm gap-2"
                            >
                              <VideoIcon className="size-4" />
                              Start
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCancelInterview(interview._id)}
                              className="btn btn-error btn-sm btn-outline gap-2"
                            >
                              <XIcon className="size-4" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Interviews */}
          <div>
            <h2 className="text-2xl font-bold mb-4">All Scheduled Interviews</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : interviews.length === 0 ? (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body text-center py-12">
                  <CalendarIcon className="size-16 mx-auto text-base-content/30 mb-4" />
                  <p className="text-lg text-base-content/60">
                    No scheduled interviews found
                  </p>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="btn btn-primary mt-4 mx-auto"
                  >
                    Schedule Your First Interview
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.map((interview) => {
                  const role = getInterviewRole(interview);
                  const otherPerson = role === "interviewer" ? interview.candidate : interview.interviewer;
                  
                  return (
                    <div key={interview._id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="card-body">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="badge badge-primary">{role}</div>
                              <div className={`badge ${getStatusColor(interview.status)}`}>
                                {interview.status}
                              </div>
                              <div className={`badge ${getDifficultyColor(interview.difficulty)}`}>
                                {interview.difficulty}
                              </div>
                            </div>

                            <h3 className="text-xl font-bold mb-2">
                              {interview.title || interview.problem}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="size-4 text-primary" />
                                <span>{formatDateTime(interview.scheduledStartTime)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ClockIcon className="size-4 text-primary" />
                                <span>{interview.duration} minutes</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <UserIcon className="size-4 text-primary" />
                                <span>
                                  {role === "interviewer" ? "Candidate: " : "Interviewer: "}
                                  {otherPerson?.name}
                                </span>
                              </div>
                            </div>

                            {interview.description && (
                              <p className="text-sm text-base-content/70 mt-2">
                                {interview.description}
                              </p>
                            )}

                            <div className="text-xs text-base-content/50 mt-2">
                              Meeting Code: <span className="font-mono font-bold">{interview.meetingCode}</span>
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col gap-2">
                            {interview.status === "scheduled" && (
                              <>
                                {canStartInterview(interview) && (
                                  <button
                                    onClick={() => handleStartInterview(interview)}
                                    className="btn btn-success gap-2"
                                  >
                                    <VideoIcon className="size-4" />
                                    Start
                                  </button>
                                )}
                                <button
                                  onClick={() => handleCancelInterview(interview._id)}
                                  className="btn btn-error btn-outline gap-2"
                                >
                                  <XIcon className="size-4" />
                                  Cancel
                                </button>
                              </>
                            )}
                            {interview.status === "completed" && (
                              <button
                                onClick={() => navigate(`/session/${interview._id}`)}
                                className="btn btn-ghost gap-2"
                              >
                                View Details
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ScheduleInterviewModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSuccess={() => {
          fetchInterviews();
          fetchUpcoming();
        }}
      />
    </>
  );
}

export default SchedulePage;
