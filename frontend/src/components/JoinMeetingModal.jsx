import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRightIcon, Loader2Icon, VideoIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";

function JoinMeetingModal({ isOpen, onClose }) {
  const [meetingCode, setMeetingCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    
    if (!meetingCode.trim()) {
      toast.error("Please enter a meeting code");
      return;
    }

    setIsJoining(true);
    
    try {
      // Format the code (remove spaces and convert to uppercase)
      const formattedCode = meetingCode.trim().toUpperCase().replace(/\s/g, '');
      
      // Navigate to the session page with the meeting code
      navigate(`/session/${formattedCode}`);
      onClose();
    } catch (error) {
      toast.error("Failed to join meeting");
      console.error(error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCodeChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Auto-format with dashes (ABC-123-XYZ)
    if (value.length > 3 && value.length <= 6) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 6) {
      value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 9);
    }
    
    setMeetingCode(value);
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box relative max-w-md">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
        >
          <XIcon className="size-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-4">
            <VideoIcon className="size-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-base-content">Join Meeting</h3>
          <p className="text-base-content/60 mt-2">
            Enter the meeting code to join an existing session
          </p>
        </div>

        <form onSubmit={handleJoinMeeting} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Meeting Code</span>
            </label>
            <input
              type="text"
              value={meetingCode}
              onChange={handleCodeChange}
              placeholder="ABC-123-XYZ"
              maxLength={11}
              className="input input-bordered input-lg w-full text-center text-xl font-mono tracking-wider focus:input-primary"
              disabled={isJoining}
            />
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                Format: XXX-XXX-XXX
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isJoining || meetingCode.length < 9}
            className="btn btn-primary w-full btn-lg gap-2 group"
          >
            {isJoining ? (
              <>
                <Loader2Icon className="size-5 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                Join Meeting
                <ArrowRightIcon className="size-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="divider text-sm text-base-content/60">OR</div>

        <div className="text-center">
          <p className="text-sm text-base-content/70 mb-3">
            Don't have a meeting code?
          </p>
          <button
            onClick={() => {
              onClose();
              // You can trigger create session modal here if needed
            }}
            className="btn btn-outline btn-sm"
          >
            Create New Meeting
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default JoinMeetingModal;
