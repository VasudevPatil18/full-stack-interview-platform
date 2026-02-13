import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useSessionRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  // Start recording
  const startRecording = useCallback(async (stream) => {
    try {
      // Check browser support
      if (!MediaRecorder.isTypeSupported('video/webm')) {
        toast.error('Recording not supported in this browser');
        return false;
      }

      chunksRef.current = [];
      streamRef.current = stream;

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        stopTimer();
      };

      mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error:', error);
        toast.error('Recording error occurred');
        stopRecording();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      startTimer();
      
      toast.success('Recording started');
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
      return false;
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      toast.success('Recording stopped');
    }
  }, [isRecording]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      stopTimer();
      toast.info('Recording paused');
    }
  }, [isRecording, isPaused]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
      toast.info('Recording resumed');
    }
  }, [isRecording, isPaused]);

  // Timer functions
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Download recording
  const downloadRecording = useCallback((filename = 'interview-recording.webm') => {
    if (!recordedBlob) {
      toast.error('No recording available');
      return;
    }

    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Recording downloaded');
  }, [recordedBlob]);

  // Upload recording to server
  const uploadRecording = useCallback(async (sessionId, apiUrl) => {
    if (!recordedBlob) {
      toast.error('No recording available');
      return null;
    }

    try {
      const formData = new FormData();
      formData.append('recording', recordedBlob, `session-${sessionId}.webm`);
      formData.append('sessionId', sessionId);
      formData.append('duration', recordingTime);

      const response = await fetch(`${apiUrl}/sessions/${sessionId}/recording`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      toast.success('Recording uploaded successfully');
      return data;
    } catch (error) {
      console.error('Error uploading recording:', error);
      toast.error('Failed to upload recording');
      return null;
    }
  }, [recordedBlob, recordingTime]);

  // Format time (seconds to HH:MM:SS)
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset recording
  const resetRecording = useCallback(() => {
    setRecordedBlob(null);
    setRecordingTime(0);
    chunksRef.current = [];
  }, []);

  return {
    isRecording,
    isPaused,
    recordingTime: formatTime(recordingTime),
    recordedBlob,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording,
    uploadRecording,
    resetRecording,
  };
}
