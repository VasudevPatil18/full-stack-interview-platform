import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  PhoneOffIcon,
  MonitorIcon,
  MonitorOffIcon,
  MessageSquareIcon,
  XIcon,
  SendIcon,
  Loader2Icon,
  UsersIcon,
  CodeIcon,
  CopyIcon,
  CheckIcon,
} from 'lucide-react';
import { useWebRTC } from '../hooks/useWebRTC';

function WebRTCVideoCall({ session, user, isHost, isParticipant, currentCode, currentLanguage }) {
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const chatEndRef = useRef(null);

  const {
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    chatMessages,
    isConnecting,
    remoteUser,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    sendMessage,
    leaveCall,
  } = useWebRTC(session, user, isHost, isParticipant);

  // Set local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Set remote video stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleShareCode = () => {
    if (currentCode && currentCode.trim()) {
      const codeMessage = `\`\`\`${currentLanguage}\n${currentCode}\n\`\`\``;
      sendMessage(codeMessage);
    }
  };

  const CodeBlock = ({ language, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="space-y-0 max-w-full">
        <div className="flex items-center justify-between bg-base-300 px-3 py-1 rounded-t-lg">
          <span className="text-xs font-mono text-base-content/70">{language}</span>
          <button
            onClick={handleCopy}
            className="btn btn-ghost btn-xs gap-1"
            title="Copy code"
          >
            {copied ? (
              <>
                <CheckIcon className="w-3 h-3" />
                Copied!
              </>
            ) : (
              <>
                <CopyIcon className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="bg-base-300 p-3 rounded-b-lg overflow-x-auto max-w-full">
          <code className="text-xs font-mono whitespace-pre-wrap break-words">{code}</code>
        </pre>
      </div>
    );
  };

  const renderMessage = (msg) => {
    // Check if message contains code block
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
    const match = codeBlockRegex.exec(msg.message);
    
    if (match) {
      const language = match[1] || 'text';
      const code = match[2];

      return <CodeBlock language={language} code={code} />;
    }

    return <span className="whitespace-pre-wrap break-words">{msg.message}</span>;
  };

  const handleLeave = () => {
    leaveCall();
    navigate('/dashboard');
  };

  const participantCount = remoteUser ? 2 : 1;

  if (isConnecting) {
    return (
      <div className="h-full flex items-center justify-center bg-base-200">
        <div className="text-center">
          <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
          <p className="text-lg">Connecting to call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-3 relative bg-base-200 p-4">
      <div className="flex-1 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 bg-base-100 p-3 rounded-lg shadow">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-primary" />
            <span className="font-semibold">
              {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
            </span>
          </div>
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`btn btn-sm gap-2 ${isChatOpen ? 'btn-primary' : 'btn-ghost'}`}
          >
            <MessageSquareIcon className="size-4" />
            Chat
          </button>
        </div>

        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Remote Video (or placeholder) */}
          <div className="relative bg-base-300 rounded-lg overflow-hidden">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <UsersIcon className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-lg font-semibold">Waiting for other participant...</p>
                </div>
              </div>
            )}
            {remoteUser && (
              <div className="absolute bottom-4 left-4 bg-base-100/80 backdrop-blur-sm px-3 py-1 rounded-lg">
                <span className="font-semibold">{remoteUser.userName}</span>
              </div>
            )}
          </div>

          {/* Local Video */}
          <div className="relative bg-base-300 rounded-lg overflow-hidden">
            {localStream && isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <VideoOffIcon className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-lg font-semibold">Camera Off</p>
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-base-100/80 backdrop-blur-sm px-3 py-1 rounded-lg">
              <span className="font-semibold">You {isScreenSharing && '(Sharing Screen)'}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-base-100 p-4 rounded-lg shadow flex justify-center gap-3">
          <button
            onClick={toggleAudio}
            className={`btn btn-circle ${isAudioEnabled ? 'btn-ghost' : 'btn-error'}`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? (
              <MicIcon className="w-5 h-5" />
            ) : (
              <MicOffIcon className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`btn btn-circle ${isVideoEnabled ? 'btn-ghost' : 'btn-error'}`}
            title={isVideoEnabled ? 'Stop Video' : 'Start Video'}
          >
            {isVideoEnabled ? (
              <VideoIcon className="w-5 h-5" />
            ) : (
              <VideoOffIcon className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            className={`btn btn-circle ${isScreenSharing ? 'btn-primary' : 'btn-ghost'}`}
            title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          >
            {isScreenSharing ? (
              <MonitorOffIcon className="w-5 h-5" />
            ) : (
              <MonitorIcon className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={handleLeave}
            className="btn btn-circle btn-error"
            title="Leave Call"
          >
            <PhoneOffIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Panel */}
      <div
        className={`flex flex-col rounded-lg shadow overflow-hidden bg-base-100 transition-all duration-300 ease-in-out ${
          isChatOpen ? 'w-80 opacity-100' : 'w-0 opacity-0'
        }`}
      >
        {isChatOpen && (
          <>
            <div className="bg-base-200 p-3 border-b border-base-300 flex items-center justify-between">
              <h3 className="font-semibold">Session Chat</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-base-content/60 py-8">
                  <MessageSquareIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat ${
                      msg.userId === user._id ? 'chat-end' : 'chat-start'
                    }`}
                  >
                    <div className="chat-header text-xs opacity-70 mb-1">
                      {msg.userName}
                      <time className="ml-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>
                    <div
                      className={`chat-bubble ${
                        msg.userId === user._id ? 'chat-bubble-primary' : ''
                      }`}
                    >
                      {renderMessage(msg)}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-base-300 space-y-2">
              {currentCode && (
                <button
                  type="button"
                  onClick={handleShareCode}
                  className="btn btn-sm btn-outline btn-primary w-full gap-2"
                >
                  <CodeIcon className="w-4 h-4" />
                  Share Current Code
                </button>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="input input-bordered flex-1 input-sm"
                />
                <button type="submit" className="btn btn-primary btn-sm btn-circle">
                  <SendIcon className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}

export default WebRTCVideoCall;
