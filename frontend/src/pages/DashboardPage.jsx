import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useActiveSessions, useCreateSession, useMyRecentSessions } from "../hooks/useSessions";

import Navbar from "../components/Navbar";
import WelcomeSection from "../components/WelcomeSection";
import StatsCards from "../components/StatsCards";
import ActiveSessions from "../components/ActiveSessions";
import RecentSessions from "../components/RecentSessions";
import CreateSessionModal from "../components/CreateSessionModal";
import JoinMeetingModal from "../components/JoinMeetingModal";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomConfig, setRoomConfig] = useState({ problem: "", difficulty: "" });

  const createSessionMutation = useCreateSession();

  const { data: activeSessionsData, isLoading: loadingActiveSessions } = useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } = useMyRecentSessions();

  const handleCreateRoom = (inviteEmail) => {
    if (!roomConfig.problem || !roomConfig.difficulty) return;

    const payload = {
      problem: roomConfig.problem,
      difficulty: roomConfig.difficulty.toLowerCase(),
    };

    // Add inviteEmail if provided
    if (inviteEmail && inviteEmail.trim()) {
      payload.inviteEmail = inviteEmail.trim();
    }

    createSessionMutation.mutate(payload, {
      onSuccess: (data) => {
        setShowCreateModal(false);
        navigate(`/session/${data.session._id}`);
      },
    });
  };

  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];

  const isUserInSession = (session) => {
    if (!user?._id) return false;

    return session.host?._id === user._id || session.participant?._id === user._id;
  };

  return (
    <>
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <WelcomeSection 
          onCreateSession={() => setShowCreateModal(true)}
          onJoinMeeting={() => setShowJoinModal(true)}
        />

        {/* Grid layout */}
        <div className="container mx-auto px-4 md:px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <StatsCards
              activeSessionsCount={activeSessions.length}
              recentSessionsCount={recentSessions.length}
            />
            <ActiveSessions
              sessions={activeSessions}
              isLoading={loadingActiveSessions}
              isUserInSession={isUserInSession}
            />
          </div>

          <RecentSessions sessions={recentSessions} isLoading={loadingRecentSessions} />
        </div>
      </div>

      <CreateSessionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        roomConfig={roomConfig}
        setRoomConfig={setRoomConfig}
        onCreateRoom={handleCreateRoom}
        isCreating={createSessionMutation.isPending}
      />

      <JoinMeetingModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
    </>
  );
}

export default DashboardPage;
