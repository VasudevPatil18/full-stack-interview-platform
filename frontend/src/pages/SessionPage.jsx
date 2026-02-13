import WebRTCVideoCall from "../components/WebRTCVideoCall";

import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import { Loader2Icon, LogOutIcon, CodeIcon, FileTextIcon, VideoIcon } from "lucide-react";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import MeetingCodeDisplay from "../components/MeetingCodeDisplay";
import { useIsMobile } from "../hooks/useIsMobile";


function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("problem");
  const isMobile = useIsMobile();

  const { data: sessionData, isLoading: loadingSession, refetch } = useSessionById(id);

  const joinSessionMutation = useJoinSession();
  const endSessionMutation = useEndSession();

  const session = sessionData?.session;
  const isHost = session?.host?._id === user?._id;
  const isParticipant = session?.participant?._id === user?._id;

  // find the problem data based on session problem title
  const problemData = session?.problem
    ? Object.values(PROBLEMS).find((p) => p.title === session.problem)
    : null;

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(problemData?.starterCode?.[selectedLanguage] || "");

  // auto-join session if user is not already a participant and not the host
  useEffect(() => {
    if (!session || !user || loadingSession) return;
    if (isHost || isParticipant) return;

    joinSessionMutation.mutate(id, { onSuccess: refetch });

    // remove the joinSessionMutation, refetch from dependencies to avoid infinite loop
  }, [session, user, loadingSession, isHost, isParticipant, id]);

  // redirect the "participant" when session ends
  useEffect(() => {
    if (!session || loadingSession) return;

    if (session.status === "completed") navigate("/dashboard");
  }, [session, loadingSession, navigate]);

  // update code when problem loads or changes
  useEffect(() => {
    if (problemData?.starterCode?.[selectedLanguage]) {
      setCode(problemData.starterCode[selectedLanguage]);
    }
  }, [problemData, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    // use problem-specific starter code
    const starterCode = problemData?.starterCode?.[newLang] || "";
    setCode(starterCode);
    setOutput(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session? All participants will be notified.")) {
      // this will navigate the HOST to dashboard
      endSessionMutation.mutate(id, { onSuccess: () => navigate("/dashboard") });
    }
  };

  // Mobile Tab Content Renderer
  const renderMobileContent = () => {
    switch (activeTab) {
      case "problem":
        return (
          <div className="h-full overflow-y-auto bg-base-200 pb-20">
            <div className="p-4 bg-base-100 border-b border-base-300">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-xl font-bold text-base-content">
                    {session?.problem || "Loading..."}
                  </h1>
                  {problemData?.category && (
                    <p className="text-sm text-base-content/60 mt-1">{problemData.category}</p>
                  )}
                  <p className="text-xs text-base-content/60 mt-2">
                    Host: {session?.host?.name || "Loading..."} • {session?.participant ? 2 : 1}/2
                  </p>
                </div>
                <span className={`badge ${getDifficultyBadgeClass(session?.difficulty)}`}>
                  {session?.difficulty?.slice(0, 1).toUpperCase() + session?.difficulty?.slice(1) || "Easy"}
                </span>
              </div>
              {isHost && session?.status === "active" && (
                <button
                  onClick={handleEndSession}
                  disabled={endSessionMutation.isPending}
                  className="btn btn-error btn-sm gap-2 w-full"
                >
                  {endSessionMutation.isPending ? (
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOutIcon className="w-4 h-4" />
                  )}
                  End Session
                </button>
              )}
            </div>

            <div className="p-4 space-y-4">
              {session?.meetingCode && (isHost || isParticipant) && (
                <MeetingCodeDisplay meetingCode={session.meetingCode} sessionId={session._id} />
              )}

              {problemData?.description && (
                <div className="bg-base-100 rounded-lg shadow-sm p-4 border border-base-300">
                  <h2 className="text-lg font-bold mb-3 text-base-content">Description</h2>
                  <div className="space-y-2 text-sm leading-relaxed">
                    <p className="text-base-content/90">{problemData.description.text}</p>
                    {problemData.description.notes?.map((note, idx) => (
                      <p key={idx} className="text-base-content/90">{note}</p>
                    ))}
                  </div>
                </div>
              )}

              {problemData?.examples && problemData.examples.length > 0 && (
                <div className="bg-base-100 rounded-lg shadow-sm p-4 border border-base-300">
                  <h2 className="text-lg font-bold mb-3 text-base-content">Examples</h2>
                  <div className="space-y-3">
                    {problemData.examples.map((example, idx) => (
                      <div key={idx}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge badge-sm">{idx + 1}</span>
                          <p className="font-semibold text-sm text-base-content">Example {idx + 1}</p>
                        </div>
                        <div className="bg-base-200 rounded-lg p-3 font-mono text-xs space-y-1">
                          <div className="flex gap-2">
                            <span className="text-primary font-bold min-w-[60px]">Input:</span>
                            <span className="break-all">{example.input}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-secondary font-bold min-w-[60px]">Output:</span>
                            <span className="break-all">{example.output}</span>
                          </div>
                          {example.explanation && (
                            <div className="pt-2 border-t border-base-300 mt-2">
                              <span className="text-base-content/60 font-sans text-xs">
                                <span className="font-semibold">Explanation:</span> {example.explanation}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {problemData?.constraints && problemData.constraints.length > 0 && (
                <div className="bg-base-100 rounded-lg shadow-sm p-4 border border-base-300">
                  <h2 className="text-lg font-bold mb-3 text-base-content">Constraints</h2>
                  <ul className="space-y-2 text-base-content/90">
                    {problemData.constraints.map((constraint, idx) => (
                      <li key={idx} className="flex gap-2 text-xs">
                        <span className="text-primary">•</span>
                        <code className="break-all">{constraint}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      case "code":
        return (
          <div className="h-full flex flex-col pb-20">
            <div className="flex-1 min-h-0">
              <CodeEditorPanel
                selectedLanguage={selectedLanguage}
                code={code}
                isRunning={isRunning}
                onLanguageChange={handleLanguageChange}
                onCodeChange={(value) => setCode(value)}
                onRunCode={handleRunCode}
              />
            </div>
            <div className="h-48 border-t-2 border-base-300">
              <OutputPanel output={output} />
            </div>
          </div>
        );

      case "video":
        return (
          <div className="h-full bg-base-200 pb-20">
            <WebRTCVideoCall 
              session={session}
              user={user}
              isHost={isHost}
              isParticipant={isParticipant}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      {isMobile ? (
        // MOBILE LAYOUT WITH TABS
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            {renderMobileContent()}
          </div>

          {/* BOTTOM TAB NAVIGATION */}
          <div className="btm-nav btm-nav-lg bg-base-100 border-t border-base-300 z-50">
            <button
              className={activeTab === "problem" ? "active text-primary" : ""}
              onClick={() => setActiveTab("problem")}
            >
              <FileTextIcon className="w-5 h-5" />
              <span className="btm-nav-label text-xs">Problem</span>
            </button>
            <button
              className={activeTab === "code" ? "active text-primary" : ""}
              onClick={() => setActiveTab("code")}
            >
              <CodeIcon className="w-5 h-5" />
              <span className="btm-nav-label text-xs">Code</span>
            </button>
            <button
              className={activeTab === "video" ? "active text-primary" : ""}
              onClick={() => setActiveTab("video")}
            >
              <VideoIcon className="w-5 h-5" />
              <span className="btm-nav-label text-xs">Video</span>
            </button>
          </div>
        </div>
      ) : (
        // DESKTOP LAYOUT WITH PANELS
        <div className="flex-1">
          <PanelGroup direction="horizontal">
            {/* LEFT PANEL - CODE EDITOR & PROBLEM DETAILS */}
            <Panel defaultSize={50} minSize={30}>
              <PanelGroup direction="vertical">
                {/* PROBLEM DSC PANEL */}
                <Panel defaultSize={50} minSize={20}>
                  <div className="h-full overflow-y-auto bg-base-200">
                    {/* HEADER SECTION */}
                    <div className="p-6 bg-base-100 border-b border-base-300">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h1 className="text-3xl font-bold text-base-content">
                            {session?.problem || "Loading..."}
                          </h1>
                          {problemData?.category && (
                            <p className="text-base-content/60 mt-1">{problemData.category}</p>
                          )}
                          <p className="text-base-content/60 mt-2">
                            Host: {session?.host?.name || "Loading..."} •{" "}
                            {session?.participant ? 2 : 1}/2 participants
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`badge badge-lg ${getDifficultyBadgeClass(
                              session?.difficulty
                            )}`}
                          >
                            {session?.difficulty.slice(0, 1).toUpperCase() +
                              session?.difficulty.slice(1) || "Easy"}
                          </span>
                          {isHost && session?.status === "active" && (
                            <button
                              onClick={handleEndSession}
                              disabled={endSessionMutation.isPending}
                              className="btn btn-error btn-sm gap-2"
                            >
                              {endSessionMutation.isPending ? (
                                <Loader2Icon className="w-4 h-4 animate-spin" />
                              ) : (
                                <LogOutIcon className="w-4 h-4" />
                              )}
                              End Session
                            </button>
                          )}
                          {session?.status === "completed" && (
                            <span className="badge badge-ghost badge-lg">Completed</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Meeting Code Display */}
                      {session?.meetingCode && (isHost || isParticipant) && (
                        <MeetingCodeDisplay 
                          meetingCode={session.meetingCode}
                          sessionId={session._id}
                        />
                      )}

                      {/* problem desc */}
                      {problemData?.description && (
                        <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                          <h2 className="text-xl font-bold mb-4 text-base-content">Description</h2>
                          <div className="space-y-3 text-base leading-relaxed">
                            <p className="text-base-content/90">{problemData.description.text}</p>
                            {problemData.description.notes?.map((note, idx) => (
                              <p key={idx} className="text-base-content/90">
                                {note}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* examples section */}
                      {problemData?.examples && problemData.examples.length > 0 && (
                        <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                          <h2 className="text-xl font-bold mb-4 text-base-content">Examples</h2>

                          <div className="space-y-4">
                            {problemData.examples.map((example, idx) => (
                              <div key={idx}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="badge badge-sm">{idx + 1}</span>
                                  <p className="font-semibold text-base-content">Example {idx + 1}</p>
                                </div>
                                <div className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                                  <div className="flex gap-2">
                                    <span className="text-primary font-bold min-w-[70px]">
                                      Input:
                                    </span>
                                    <span>{example.input}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <span className="text-secondary font-bold min-w-[70px]">
                                      Output:
                                    </span>
                                    <span>{example.output}</span>
                                  </div>
                                  {example.explanation && (
                                    <div className="pt-2 border-t border-base-300 mt-2">
                                      <span className="text-base-content/60 font-sans text-xs">
                                        <span className="font-semibold">Explanation:</span>{" "}
                                        {example.explanation}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Constraints */}
                      {problemData?.constraints && problemData.constraints.length > 0 && (
                        <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                          <h2 className="text-xl font-bold mb-4 text-base-content">Constraints</h2>
                          <ul className="space-y-2 text-base-content/90">
                            {problemData.constraints.map((constraint, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span className="text-primary">•</span>
                                <code className="text-sm">{constraint}</code>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Panel>

                <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                <Panel defaultSize={50} minSize={20}>
                  <PanelGroup direction="vertical">
                    <Panel defaultSize={70} minSize={30}>
                      <CodeEditorPanel
                        selectedLanguage={selectedLanguage}
                        code={code}
                        isRunning={isRunning}
                        onLanguageChange={handleLanguageChange}
                        onCodeChange={(value) => setCode(value)}
                        onRunCode={handleRunCode}
                      />
                    </Panel>

                    <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                    <Panel defaultSize={30} minSize={15}>
                      <OutputPanel output={output} />
                    </Panel>
                  </PanelGroup>
                </Panel>
              </PanelGroup>
            </Panel>

            <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

            {/* RIGHT PANEL - VIDEO CALLS & CHAT */}
            <Panel defaultSize={50} minSize={30}>
              <div className="h-full bg-base-200">
                <WebRTCVideoCall 
                  session={session}
                  user={user}
                  isHost={isHost}
                  isParticipant={isParticipant}
                />
              </div>
            </Panel>
          </PanelGroup>
        </div>
      )}
    </div>
  );
}

export default SessionPage;
