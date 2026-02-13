import { CheckIcon, CopyIcon, LinkIcon, ShareIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

function MeetingCodeDisplay({ meetingCode, sessionId }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const meetingLink = `${window.location.origin}/session/${meetingCode || sessionId}`;

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      
      if (type === 'code') {
        setCopiedCode(true);
        toast.success("Meeting code copied!");
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        toast.success("Meeting link copied!");
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const shareMeeting = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join my coding session',
        text: `Join my coding interview session with code: ${meetingCode}`,
        url: meetingLink,
      }).catch(() => {
        // User cancelled or error occurred
      });
    } else {
      copyToClipboard(meetingLink, 'link');
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-base-content flex items-center gap-2">
          <LinkIcon className="size-4" />
          Meeting Details
        </h4>
        <button
          onClick={shareMeeting}
          className="btn btn-ghost btn-xs gap-1"
          title="Share meeting"
        >
          <ShareIcon className="size-3" />
          Share
        </button>
      </div>

      {meetingCode && (
        <div className="mb-3">
          <label className="text-xs text-base-content/60 mb-1 block">Meeting Code</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-base-100 rounded-lg px-4 py-3 font-mono text-xl font-bold text-center tracking-wider border border-base-300">
              {meetingCode}
            </div>
            <button
              onClick={() => copyToClipboard(meetingCode, 'code')}
              className="btn btn-square btn-primary"
              title="Copy code"
            >
              {copiedCode ? (
                <CheckIcon className="size-5" />
              ) : (
                <CopyIcon className="size-5" />
              )}
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="text-xs text-base-content/60 mb-1 block">Meeting Link</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-base-100 rounded-lg px-3 py-2 text-sm truncate border border-base-300">
            {meetingLink}
          </div>
          <button
            onClick={() => copyToClipboard(meetingLink, 'link')}
            className="btn btn-square btn-outline btn-sm"
            title="Copy link"
          >
            {copiedLink ? (
              <CheckIcon className="size-4" />
            ) : (
              <CopyIcon className="size-4" />
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 text-xs text-base-content/60 text-center">
        Share this code or link with others to join your session
      </div>
    </div>
  );
}

export default MeetingCodeDisplay;
