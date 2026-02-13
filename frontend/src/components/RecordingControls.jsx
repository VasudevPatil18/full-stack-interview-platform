import { CircleIcon, DownloadIcon, PlayIcon, SquareIcon, TrashIcon } from "lucide-react";
import useCallRecording from "../hooks/useCallRecording";

function RecordingControls() {
  const {
    isRecording,
    recordingTime,
    recordingBlob,
    startRecording,
    stopRecording,
    downloadRecording,
    discardRecording,
  } = useCallRecording();

  return (
    <div className="space-y-3">
      {/* Recording Controls */}
      {!recordingBlob && (
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="btn btn-error btn-sm gap-2 flex-1"
              title="Start Recording"
            >
              <CircleIcon className="size-4 fill-current" />
              Start Recording
            </button>
          ) : (
            <>
              <button
                onClick={stopRecording}
                className="btn btn-error btn-sm gap-2 flex-1"
                title="Stop Recording"
              >
                <SquareIcon className="size-4 fill-current" />
                Stop Recording
              </button>
              <div className="badge badge-error gap-2 px-3 py-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                {recordingTime}
              </div>
            </>
          )}
        </div>
      )}

      {/* Recording Ready - Download/Discard */}
      {recordingBlob && (
        <div className="alert alert-success shadow-lg">
          <div className="flex-1">
            <PlayIcon className="size-5" />
            <div>
              <h3 className="font-bold">Recording Ready!</h3>
              <div className="text-xs">Duration: {recordingTime}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadRecording}
              className="btn btn-success btn-sm gap-2"
              title="Download Recording"
            >
              <DownloadIcon className="size-4" />
              Download
            </button>
            <button
              onClick={discardRecording}
              className="btn btn-ghost btn-sm"
              title="Discard Recording"
            >
              <TrashIcon className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Recording Info */}
      {!isRecording && !recordingBlob && (
        <div className="text-xs text-base-content/60 text-center">
          Click to record your screen, audio, and video
        </div>
      )}
    </div>
  );
}

export default RecordingControls;
