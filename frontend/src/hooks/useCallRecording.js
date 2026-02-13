import { useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";

/**
 * Custom hook for client-side call recording using MediaRecorder API
 * Records video, audio, and screen sharing
 */
function useCallRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingBlob, setRecordingBlob] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Get display media (screen + audio)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
        audio: true,
      });

      // Get user media (microphone)
      let audioStream;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
      } catch (error) {
        console.warn("Could not get microphone access:", error);
      }

      // Combine streams
      const tracks = [...displayStream.getTracks()];
      if (audioStream) {
        tracks.push(...audioStream.getAudioTracks());
      }

      const combinedStream = new MediaStream(tracks);
      streamRef.current = combinedStream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp9",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordingBlob(blob);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        
        toast.success("Recording saved! Click download to save the file.");
      };

      // Handle stream end (user stops sharing)
      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.success("Recording started!");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording. Please allow screen sharing.");
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  }, [isRecording]);

  // Download recording
  const downloadRecording = useCallback(() => {
    if (recordingBlob) {
      const url = URL.createObjectURL(recordingBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `session-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Recording downloaded!");
      setRecordingBlob(null);
      setRecordingTime(0);
    }
  }, [recordingBlob]);

  // Discard recording
  const discardRecording = useCallback(() => {
    setRecordingBlob(null);
    setRecordingTime(0);
    toast.success("Recording discarded");
  }, []);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    isRecording,
    recordingTime: formatTime(recordingTime),
    recordingBlob,
    startRecording,
    stopRecording,
    downloadRecording,
    discardRecording,
  };
}

export default useCallRecording;
