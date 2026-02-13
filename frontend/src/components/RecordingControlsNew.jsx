import { CircleIcon, PauseIcon, PlayIcon, DownloadIcon, UploadIcon, Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { useSessionRecording } from '../hooks/useSessionRecording';

function RecordingControlsNew({ localStream, remoteStream, sessionId }) {
  const [isUploading, setIsUploading] = useState(false);
  
  const {
    isRecording,
    isPaused,
    recordingTime,
    recordedBlob,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording,
    uploadRecording,
    resetRecording,
  } = useSessionRecording();

  const handleStartRecording = async () => {
    // Combine local and remote streams
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    // Create a combined stream
    const combinedStream = canvas.captureStream(30); // 30 FPS

    // Add audio from local stream
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        combinedStream.addTrack(track);
      });
    }

    // Draw video frames
    const localVideo = document.createElement('video');
    const remoteVideo = document.createElement('video');
    
    if (localStream) {
      localVideo.srcObject = localStream;
      localVideo.play();
    }
    
    if (remoteStream) {
      remoteVideo.srcObject = remoteStream;
      remoteVideo.play();
    }

    // Render loop
    const render = () => {
      if (!isRecording) return;
      
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw remote video (larger)
      if (remoteVideo.readyState === remoteVideo.HAVE_ENOUGH_DATA) {
        ctx.drawImage(remoteVideo, 0, 0, canvas.width, canvas.height);
      }
      
      // Draw local video (picture-in-picture)
      if (localVideo.readyState === localVideo.HAVE_ENOUGH_DATA) {
        const pipWidth = 320;
        const pipHeight = 180;
        const pipX = canvas.width - pipWidth - 20;
        const pipY = canvas.height - pipHeight - 20;
        
        ctx.drawImage(localVideo, pipX, pipY, pipWidth, pipHeight);
        
        // Border for PIP
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(pipX, pipY, pipWidth, pipHeight);
      }
      
      requestAnimationFrame(render);
    };

    await startRecording(combinedStream);
    render();
  };

  const handleUpload = async () => {
    setIsUploading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    await uploadRecording(sessionId, apiUrl);
    setIsUploading(false);
  };

  const handleDownload = () => {
    const filename = `interview-${sessionId}-${Date.now()}.webm`;
    downloadRecording(filename);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center gap-2 px-3 py-1 bg-error/10 rounded-lg">
          <div className="relative">
            <CircleIcon className="w-3 h-3 fill-error text-error animate-pulse" />
          </div>
          <span className="text-sm font-mono font-semibold">{recordingTime}</span>
          {isPaused && <span className="text-xs text-warning">(Paused)</span>}
        </div>
      )}

      {/* Recording Controls */}
      {!isRecording && !recordedBlob && (
        <button
          onClick={handleStartRecording}
          className="btn btn-sm btn-error gap-2"
          title="Start Recording"
        >
          <CircleIcon className="w-4 h-4 fill-current" />
          <span className="hidden sm:inline">Start Recording</span>
        </button>
      )}

      {isRecording && !isPaused && (
        <>
          <button
            onClick={pauseRecording}
            className="btn btn-sm btn-warning gap-2"
            title="Pause Recording"
          >
            <PauseIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Pause</span>
          </button>
          <button
            onClick={stopRecording}
            className="btn btn-sm btn-neutral gap-2"
            title="Stop Recording"
          >
            <div className="w-3 h-3 bg-current rounded-sm" />
            <span className="hidden sm:inline">Stop</span>
          </button>
        </>
      )}

      {isRecording && isPaused && (
        <>
          <button
            onClick={resumeRecording}
            className="btn btn-sm btn-success gap-2"
            title="Resume Recording"
          >
            <PlayIcon className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Resume</span>
          </button>
          <button
            onClick={stopRecording}
            className="btn btn-sm btn-neutral gap-2"
            title="Stop Recording"
          >
            <div className="w-3 h-3 bg-current rounded-sm" />
            <span className="hidden sm:inline">Stop</span>
          </button>
        </>
      )}

      {/* Playback Controls */}
      {recordedBlob && !isRecording && (
        <div className="flex items-center gap-2">
          <div className="badge badge-success gap-1">
            <CircleIcon className="w-2 h-2 fill-current" />
            Recording Ready
          </div>
          
          <button
            onClick={handleDownload}
            className="btn btn-sm btn-primary gap-2"
            title="Download Recording"
          >
            <DownloadIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="btn btn-sm btn-secondary gap-2"
            title="Upload to Server"
          >
            {isUploading ? (
              <Loader2Icon className="w-4 h-4 animate-spin" />
            ) : (
              <UploadIcon className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isUploading ? 'Uploading...' : 'Upload'}
            </span>
          </button>

          <button
            onClick={resetRecording}
            className="btn btn-sm btn-ghost"
            title="New Recording"
          >
            New
          </button>
        </div>
      )}
    </div>
  );
}

export default RecordingControlsNew;
